import { composeRegex, stringMatch } from './utils';

let childrenId = -1;
let dataId = -1;

const attributeRegex = /\s*(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\s*(?::|-)\s*[a-zA-Z_])?)+\s*/;
const parenthesizedAttributeRegex = composeRegex(/\s*(?:\{|\[|\()\s*/, attributeRegex, /\s*(?:\)|\]|\})\s*/);
const attributeAssignmentRegex = /\s*=\s*(?:{|"|')\s*/;
const spreadAttributeRegex = /\s*\{\s*\.\.\.\s*/;

const tagCloses = [{
  regex: /\s*>/,
}, {
  regex: /\s*\/\s*>/,
}];

const tagAttributes = [
  ...tagCloses,
  {
    regex: attributeRegex,
  },
  {
    regex: parenthesizedAttributeRegex,
  },
  {
    regex: attributeRegex,
    alternatives: [
      ...tagCloses,
      {
        regex: attributeAssignmentRegex,
      },
      {
        regex: spreadAttributeRegex,
      },
    ],
  },
  {
    regex: parenthesizedAttributeRegex,
    alternatives: [
      ...tagCloses,
      {
        regex: attributeAssignmentRegex,
      },
      {
        regex: spreadAttributeRegex,
      },
    ],
  },
  {
    regex: spreadAttributeRegex,
  },
];

tagAttributes[2].alternatives = tagAttributes;
tagAttributes[3].alternatives = tagAttributes;

const tagMatcher = {
  regex: /</,
  alternatives: [{
    regex: /!--/,
  }, {
    regex: /\s*(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\s*(?::|->?|\.)\s*[a-zA-Z_])?)+\s*/,
    alternatives: tagAttributes,
  }],
};

const isTagOpen = str => stringMatch(str, tagMatcher);

const normalizeNewLines = str => str.replace(/\s*\n\s*/g, ' ');

const escape = (char, str) => str.replace(new RegExp(`(${char})`, 'g'), '\\$1');

const escapeQuotes = escape.bind(null, '"');

const getTagName = sel => (
  sel.indexOf('u8"') === 0
    ? sel.slice(0, -1).replace('u8"', '')
    : sel
);

const identity = x => x;

const filterByType = (type, formatter, data) =>
  data
    .filter(attribute => attribute.type === type)
    .filter((obj, index, arr) =>
      arr.map(mapObj => mapObj.name).lastIndexOf(obj.name) === index,
    )
    .map(attribute => ({
      ...attribute,
      value: formatter(attribute.value),
    }));

const filterAttrs = filterByType.bind(null, 'attr', identity);
const filterProps = filterByType.bind(null, 'prop', value => (
  value.indexOf('emscripten::val') !== 0 ? `emscripten::val(${value})` : value
));
const filterCallbacks = filterByType.bind(null, 'callback', identity);

const createMaps = maps =>
  maps.map(map => (
    map.values.length === 0
      ? ''
      : `${map.id} {${
        map.values
          .map(attr => `{${attr.name}, ${attr.value}}`)
          .join(', ')
      }}`
  )).filter(map => map !== '')
    .join(', ');

let createVNode;

const getChildrenDeclaration = children =>
  `asmdom::Children {${children.map(createVNode).join(', ')}}`;

const getDataDeclaration = data => `asmdom::Data (${createMaps([
  { id: 'asmdom::Attrs', values: filterAttrs(data) },
  { id: 'asmdom::Props', values: filterProps(data) },
  { id: 'asmdom::Callbacks', values: filterCallbacks(data) },
])})`;

const splitArray = (arr, predicate) => {
  const result = [];
  let slicedArray = arr;
  while (slicedArray.length !== 0) {
    if (predicate(slicedArray[0])) {
      result.push(slicedArray[0]);
      slicedArray = slicedArray.slice(1, slicedArray.length);
    } else {
      const vectorIndex = slicedArray.findIndex(predicate);
      if (vectorIndex !== -1) {
        result.push(slicedArray.slice(0, vectorIndex));
        slicedArray = slicedArray.slice(vectorIndex);
      } else {
        result.push(slicedArray);
        slicedArray = [];
      }
    }
  }
  return result;
};

const aggregateStrings = (vnodes) => {
  if (vnodes.length === 1) return vnodes[0];
  return {
    type: 'string',
    aggregated: true,
    value: vnodes.map((vnode, index) => {
      let { value } = vnode;

      if (vnode.type === 'CPXText') {
        if (index === 0) {
          value = value.replace(/^\s+/, '');
        } else if (index === vnodes.length - 1) {
          value = value.replace(/\s+$/, '');
        }
        return `u8"${value}"`;
      } else if (vnode.type === 'string') {
        return `std::string(${value.trim()})`;
      }
      return '';
    }).join(' + '),
  };
};

const aggregateNodes = (vnodes) => {
  const computedVnodes = [];
  let strings = [];
  for (let i = 0; i < vnodes.length; i += 1) {
    const child = vnodes[i];
    if (child.type === 'CPXText' || child.type === 'string') {
      strings.push(child);
    } else {
      if (strings.length !== 0) {
        computedVnodes.push(aggregateStrings(strings));
        strings = [];
      }
      computedVnodes.push(child);
    }
  }
  if (strings.length !== 0) {
    computedVnodes.push(aggregateStrings(strings));
  }
  return computedVnodes;
};

createVNode = (vnode) => {
  let compiledVNode;
  if (vnode.type === 'VNode') return vnode.value;
  if (vnode.type === 'string') return `asmdom::h(${vnode.value.trim()}, true)`;
  if (vnode.type === 'CPXText') return `asmdom::h(u8"${vnode.value.trim()}", true)`;
  if (vnode.type === 'CPXComment') return `asmdom::h(u8"!", std::string(u8"${escapeQuotes(vnode.value)}"))`;
  if (vnode.type === 'CPXElement') {
    compiledVNode = `asmdom::h(${vnode.sel}`;

    if (vnode.data !== undefined) {
      if (vnode.data.length === 1 && vnode.data[0].type === 'spread') {
        compiledVNode += `, ${vnode.data[0].value}`;
      } else if (vnode.data.length > 0) {
        if (vnode.data.find(x => x.type === 'spread') !== undefined) {
          // eslint-disable-next-line
          const resultVar = `_asmdom_data_concat_${++dataId}`;
          const dataGroups = splitArray(vnode.data, x => x.type === 'spread').map(group => ({
            // eslint-disable-next-line
            identifier: `_asmdom_data_concat_${++dataId}`,
            value: group,
          }));
          const identifiers = dataGroups.map(x => x.identifier).reverse();
          compiledVNode += ', [&]() -> asmdom::Data {';
          compiledVNode += `asmdom::Data ${resultVar};`;
          compiledVNode += dataGroups.map(
            ({ identifier, value }) => `asmdom::Data ${identifier} = ${value.type === 'spread' ? value.value : getDataDeclaration(value)};`,
          ).join('');
          compiledVNode += identifiers.map(
            (x) => {
              let result = `${resultVar}.attrs.insert(${x}.attrs.begin(), ${x}.attrs.end());`;
              result += `${resultVar}.props.insert(${x}.props.begin(), ${x}.props.end());`;
              result += `${resultVar}.callbacks.insert(${x}.callbacks.begin(), ${x}.callbacks.end());`;
              return result;
            },
          ).join('');
          compiledVNode += `return ${resultVar};}()`;
        } else {
          compiledVNode += `, ${getDataDeclaration(vnode.data)}`;
        }
      }
    }

    if (vnode.children !== undefined) {
      const children = aggregateNodes(
        vnode.children.filter(child => child.type !== 'comment'),
      );

      if (children.length === 1) {
        compiledVNode += ', ';
        if (children[0].type === 'CPXText') {
          compiledVNode += `std::string(u8"${children[0].value.trim()}")`;
        } else if (children[0].type === 'string') {
          compiledVNode += children[0].aggregated !== true
            ? `std::string(${children[0].value.trim()})`
            : children[0].value.trim();
        } else if (children[0].type === 'Children') {
          compiledVNode += children[0].value;
        } else {
          compiledVNode += createVNode(children[0]);
        }
      } else if (children.length > 1) {
        if (children.find(child => child.type === 'Children') !== undefined) {
          // eslint-disable-next-line
          const resultVar = `_asmdom_ch_concat_${++childrenId}`;
          const childrenGroups = splitArray(children, x => x.type === 'Children').map(group => ({
            // eslint-disable-next-line
            identifier: `_asmdom_ch_concat_${++childrenId}`,
            value: group,
          }));
          const identifiers = childrenGroups.map(x => x.identifier);
          compiledVNode += ', [&]() -> asmdom::Children {';
          compiledVNode += `asmdom::Children ${resultVar};`;
          compiledVNode += childrenGroups.map(
            ({ identifier, value }) => `asmdom::Children ${identifier} = ${value.type === 'Children' ? value.value : getChildrenDeclaration(value)};`,
          ).join('');
          compiledVNode += `${resultVar}.reserve(${identifiers.map(x => `${x}.size()`).join(' + ')});`;
          compiledVNode += identifiers.map(
            x => `${resultVar}.insert(${resultVar}.end(), ${x}.begin(), ${x}.end());`,
          ).join('');
          compiledVNode += `return ${resultVar};}()`;
        } else {
          compiledVNode += `, ${getChildrenDeclaration(children)}`;
        }
      }
    }

    compiledVNode += ')';
  }
  return compiledVNode;
};

export default {
  createVNode,
  normalizeNewLines,
  escapeQuotes,
  getTagName,
  isTagOpen,
};
