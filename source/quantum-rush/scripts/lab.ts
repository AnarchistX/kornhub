import { LAB } from '../src/content/levels';
import { buildLevel } from '../src/engine/build';
import { validate } from '../src/engine/validate';
const level = buildLevel(LAB);
console.log(validate(level).lines.join('\n'));
