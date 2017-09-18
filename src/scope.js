const normalizeNewLines = str => str.replace(/\s*\n\s*/g, ' ');

const escape = (char, str) => str.replace(new RegExp(`(${char})`, 'g'), '\\$1');

const escapeQuotes = escape.bind(null, '"');

const getTagName = (sel) => {
  if (sel.indexOf('u8"') === 0) {
    return sel.substring(0, sel.length - 1).replace('u8"', '');
  }
  return sel;
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
  maps.map((map) => {
    let res = '';
    if (map.values.length !== 0) {
      res += `${map.id} {`;
      res += map.values
        .map(attr => `{${attr.name}, ${attr.value}}`)
        .join(', ');
      res += '}';
    }
    return res;
  }).filter(map => map !== '')
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

const createVNode = (data) => {
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
        } else {
          vnode += createVNode(children[0]);
        }
      } else if (children.length > 1) {
        vnode += `, asmdom::Children {${children.map(createVNode).join(', ')}}`;
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
};
