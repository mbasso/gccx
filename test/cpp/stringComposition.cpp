#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"div", u8"Hello " + std::string("a") + u8" foo");
	delete vnode;
	vnode = asmdom::h(u8"div", std::string("Hello") + u8" foo");
	delete vnode;
	std::string hello("Hello");
	vnode = asmdom::h(u8"div", std::string(hello) + u8" foo");
	delete vnode;
}
