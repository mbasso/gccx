#include "../path-to-asm-dom/asm-dom.hpp"
#include <emscripten.h>

int main() {
	Config config = Config();
	init(config);

	asmdom::VNode* vnode = (
		<div>
			<h1>Hello world!</h1>
			I'm compiled with gccx
		</div>
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
