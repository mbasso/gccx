#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"!", std::string(u8" Hello world! "));
	delete vnode;
}
