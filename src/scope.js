import { composeRegex, stringMatch } from './utils';

let id = -1;

const attributeRegex = /\s*(?:[a-zA-Z_][a-zA-Z0-9_]*(?:\s*(?::|-)\s*[a-zA-Z_])?)+\s*/;
const parenthesizedAttributeRegex = composeRegex(/\s*(?:\{|\[|\()\s*/, attributeRegex, /\s*(?:\)|\]|\})\s*/);
const attributeAssignmentRegex = /\s*=\s*(?:{|"|')\s*/;

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
    ],
  },
  {
    regex: parenthesizedAttributeRegex,
    alternatives: [
      ...tagCloses,
      {
        regex: attributeAssignmentRegex,
      },
    ],
  }];

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

let createVNode;

const getChildrenDeclaration = children =>
  `asmdom::Children {${children.map(createVNode).join(', ')}}`;

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

const filterByType = (type, vnode) =>
  vnode.data
    .filter(attribute => attribute.type === type)
    .filter((obj, index, arr) =>
      arr.map(mapObj => mapObj.name).lastIndexOf(obj.name) === index,
    );

const filterAttrs = filterByType.bind(null, 'attr');
const filterProps = filterByType.bind(null, 'prop');
const filterCallbacks = filterByType.bind(null, 'callback');

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

createVNode = (data) => {
  let vnode;
  if (data.type === 'VNode') return data.value;
  if (data.type === 'string') return `asmdom::h(${data.value.trim()}, true)`;
  if (data.type === 'CPXText') return `asmdom::h(u8"${data.value.trim()}", true)`;
  if (data.type === 'CPXComment') return `asmdom::h(u8"!", std::string(u8"${escapeQuotes(data.value)}"))`;
  if (data.type === 'CPXElement') {
    vnode = `asmdom::h(${data.sel}`;

    if (data.data !== undefined && data.data.length !== 0) {
      vnode += ', asmdom::Data (';
      vnode += createMaps([
        { id: 'asmdom::Attrs', values: filterAttrs(data) },
        { id: 'asmdom::Props', values: filterProps(data) },
        { id: 'asmdom::Callbacks', values: filterCallbacks(data) },
      ]);
      vnode += ')';
    }

    if (data.children !== undefined) {
      const children = aggregateNodes(
        data.children.filter(child => child.type !== 'comment'),
      );

      if (children.length === 1) {
        vnode += ', ';
        if (children[0].type === 'CPXText') {
          vnode += `std::string(u8"${children[0].value.trim()}")`;
        } else if (children[0].type === 'string') {
          vnode += children[0].aggregated !== true
            ? `std::string(${children[0].value.trim()})`
            : children[0].value.trim();
        } else if (children[0].type === 'Children') {
          vnode += children[0].value;
        } else {
          vnode += createVNode(children[0]);
        }
      } else if (children.length > 1) {
        if (children.find(child => child.type === 'Children') !== undefined) {
          // eslint-disable-next-line
          const resultVar = `_asmdom_ch_concat_${++id}`;
          const childrenGroups = splitArray(children, x => x.type === 'Children').map(group => ({
            // eslint-disable-next-line
            identifier: `_asmdom_ch_concat_${++id}`,
            value: group,
          }));
          const identifiers = childrenGroups.map(x => x.identifier);
          vnode += ', [&]() -> asmdom::Children {';
          vnode += `asmdom::Children ${resultVar};`;
          vnode += childrenGroups.map(
            ({ identifier, value }) => `asmdom::Children ${identifier} = ${value.type === 'Children' ? value.value : getChildrenDeclaration(value)};`,
          ).join('');
          vnode += `${resultVar}.reserve(${identifiers.map(x => `${x}.size()`).join(' + ')});`;
          vnode += identifiers.map(
            x => `${resultVar}.insert(${resultVar}.end(), ${x}.begin(), ${x}.end());`,
          ).join('');
          vnode += `return ${resultVar};}()`;
        } else {
          vnode += `, ${getChildrenDeclaration(children)}`;
        }
      }
    }

    vnode += ')';
  }
  return vnode;
};

export default {
  createVNode,
  normalizeNewLines,
  escapeQuotes,
  getTagName,
  isTagOpen,
};
