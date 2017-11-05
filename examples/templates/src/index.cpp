#include "../path-to-asm-dom/asm-dom.hpp"
#include <emscripten.h>

int main() {
	Config config = Config();
	init(config);

	asmdom::VNode* vnode = REQUIRE_TEMPLATE("HelloWorld.cpx");

	patch(
		emscripten::val::global("document").call<emscripten::val>(
			"getElementById",
			std::string("root")
		),
		vnode
	);

	return 0;
};
