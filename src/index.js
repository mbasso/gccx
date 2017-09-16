import { parser } from './language';
import scope from './scope';

parser.yy = scope;

export default parser;
