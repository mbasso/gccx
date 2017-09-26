#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}}));
	delete vnode;
}
