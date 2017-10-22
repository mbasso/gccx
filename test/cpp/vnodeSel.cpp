#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"
#include <string>

struct Baz {
	std::string bar;
};

struct Foo {
	std::string bar;
	struct Baz baz;
};

int main() {
	asmdom::VNode* vnode = asmdom::h(u8"span");
	delete vnode;
	vnode = asmdom::h(u8"foo-bar");
	delete vnode;
	vnode = asmdom::h(u8"foo:bar");
	delete vnode;

	struct Foo foo;
	vnode = asmdom::h(foo.bar);
	delete vnode;
	vnode = asmdom::h(foo.baz.bar);
	delete vnode;

	struct Foo* fooPtr = new struct Foo();
	vnode = asmdom::h(fooPtr->bar);
	delete vnode;
	vnode = asmdom::h(fooPtr->baz.bar);
	delete vnode;
}
