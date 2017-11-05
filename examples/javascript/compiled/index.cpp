#include "../path-to-asm-dom/asm-dom.hpp"
#include <emscripten.h>

int main() {
	Config config = Config();
	init(config);

	asmdom::VNode* vnode = (
		asmdom::h(u8"div", asmdom::Children {asmdom::h(u8"h1", std::string(u8"Hello world!")), asmdom::h(u8"I'm compiled with gccx", true)})
	);

	patch(
		emscripten::val::global("document").call<emscripten::val>(
			"getElementById",
			std::string("root")
		),
		vnode
	);

	return 0;
};