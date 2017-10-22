#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	std::string foo;
	asmdom::VNode* vnode = asmdom::h(u8"span",
		asmdom::Data (
			asmdom::Attrs {
				{u8"attr1", u8"true"},
				{u8"attr2", u8"fooAttr"},
				{u8"attr3", foo}
			}
		)
	);
	delete vnode;
}
