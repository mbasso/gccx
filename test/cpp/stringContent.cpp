#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"div", std::string(u8"VNodestringreturn-/*.-:!= []()\"'0123456789 identifier0123456789"));
	delete vnode;
}
