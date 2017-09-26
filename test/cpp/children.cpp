#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"div", asmdom::Children {asmdom::h(u8"Hello world!", true), asmdom::h(u8"input")});
	delete vnode;
}
