#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"span");
	delete vnode;
	vnode = asmdom::h(u8"foo-bar");
	delete vnode;
	vnode = asmdom::h(u8"foo:bar");
	delete vnode;
}
