#include "../../node_modules/asm-dom/cpp/asm-dom.hpp"

int main() {
	asmdom::Data data;
	asmdom::VNode* vnode = asmdom::h(u8"span", [&]() -> asmdom::Data {
			asmdom::Data _asmdom_data_concat_0;
			asmdom::Data _asmdom_data_concat_1 = asmdom::Data (
				asmdom::Attrs {
					{u8"foo", u8"true"},
					{u8"bar", u8"true"}
				}
			);
			asmdom::Data _asmdom_data_concat_2 = data;
			_asmdom_data_concat_0.attrs.insert(_asmdom_data_concat_2.attrs.begin(), _asmdom_data_concat_2.attrs.end());
			_asmdom_data_concat_0.props.insert(_asmdom_data_concat_2.props.begin(), _asmdom_data_concat_2.props.end());
			_asmdom_data_concat_0.callbacks.insert(_asmdom_data_concat_2.callbacks.begin(), _asmdom_data_concat_2.callbacks.end());
			_asmdom_data_concat_0.attrs.insert(_asmdom_data_concat_1.attrs.begin(), _asmdom_data_concat_1.attrs.end());
			_asmdom_data_concat_0.props.insert(_asmdom_data_concat_1.props.begin(), _asmdom_data_concat_1.props.end());
			_asmdom_data_concat_0.callbacks.insert(_asmdom_data_concat_1.callbacks.begin(), _asmdom_data_concat_1.callbacks.end());
			return _asmdom_data_concat_0;
		}()
	);
	delete vnode;
}
