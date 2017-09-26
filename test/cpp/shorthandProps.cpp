#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"data-foo", emscripten::val(true)}}));
	delete vnode;
}
