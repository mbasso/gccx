#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

asmdom::VNode* getVNode() {
	return asmdom::h("div");
};

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"div", asmdom::Children {asmdom::h(u8"Hello world!", true), asmdom::h(u8"input")});
	delete vnode;
	vnode = asmdom::h(u8"div", getVNode());
	delete vnode;
	vnode = asmdom::h(u8"div",
		asmdom::Children {
			getVNode(),
			asmdom::h(u8"Hello world!", true),
			asmdom::h(u8"input")
		}
	);
	delete vnode;
}
