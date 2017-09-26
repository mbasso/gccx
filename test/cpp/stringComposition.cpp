#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"div", u8"Hello " + std::string("a") + u8" foo");
	delete vnode;
}
