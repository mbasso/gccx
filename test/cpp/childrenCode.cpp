#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

asmdom::VNode* getVNode() {
	return asmdom::h("div");
};

int main() {
	asmdom::Children foo = asmdom::Children {
		asmdom::h(u8"span")
	};
	asmdom::VNode* vnode = asmdom::h(u8"div", foo);
	delete vnode;
	vnode = asmdom::h(u8"div", [&]() -> asmdom::Children {
			asmdom::Children _asmdom_ch_concat_0;
			asmdom::Children _asmdom_ch_concat_1 = asmdom::Children {
				asmdom::h(u8"text", true),
				asmdom::h(u8"span", std::string(u8"text"))
			};
			asmdom::Children _asmdom_ch_concat_2 = foo;
			_asmdom_ch_concat_0.reserve(_asmdom_ch_concat_1.size() + _asmdom_ch_concat_2.size());
			_asmdom_ch_concat_0.insert(_asmdom_ch_concat_0.end(), _asmdom_ch_concat_1.begin(), _asmdom_ch_concat_1.end());
			_asmdom_ch_concat_0.insert(_asmdom_ch_concat_0.end(), _asmdom_ch_concat_2.begin(), _asmdom_ch_concat_2.end());
			return _asmdom_ch_concat_0;
		}()
	);
	delete vnode;
}
