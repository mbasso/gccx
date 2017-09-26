#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	std::string foo = u8"div";
	asmdom::VNode* vnode = asmdom::h(u8"span", [&]() -> asmdom::VNode* {
		return (
			asmdom::h(foo)
		);
	}());
	delete vnode;
}
