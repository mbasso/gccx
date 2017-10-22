#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

bool onClick(emscripten::val event) {
	return true;
}

int main() {
	std::string attr;
	std::string sel = u8"div";
	asmdom::VNode* vnode = asmdom::h(u8"span",
		asmdom::Data (
			asmdom::Attrs {
				{u8"attr1", u8"true"},
				{u8"attr2", u8"fooAttr"},
				{u8"attr3", attr}
			},
			asmdom::Props {
				{u8"prop1", emscripten::val(std::wstring(L"fooProp"))},
				{u8"prop2", emscripten::val(emscripten::val("string"))},
				{u8"prop3", emscripten::val(7)}
			},
			asmdom::Callbacks {
				{u8"onclick", onClick},
				{u8"onblur", [&](emscripten::val event) -> bool {
					return true;
				}}
			}
		)
	);
	delete vnode;
}
