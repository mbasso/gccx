#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	std::string foo;
	asmdom::VNode* vnode = asmdom::h(u8"span",
		asmdom::Data (
			asmdom::Props {
				{u8"prop1", emscripten::val(std::wstring(L"fooProp"))},
				{u8"prop2", emscripten::val(emscripten::val("string"))},
				{u8"prop3", emscripten::val(7)}
			}
		)
	);
	delete vnode;
}
