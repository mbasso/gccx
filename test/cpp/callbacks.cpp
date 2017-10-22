#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

bool onClick(emscripten::val event) {
	return true;
}

int main() {
	std::string sel = u8"div";
	asmdom::VNode* vnode = asmdom::h(u8"span",
		asmdom::Data (
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
