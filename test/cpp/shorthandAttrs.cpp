#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"data-foo", u8"true"}}));
	delete vnode;
}
