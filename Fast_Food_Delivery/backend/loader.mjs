import { register } from 'module';
import { pathToFileURL } from 'url';

register('./instrumentation.cjs', pathToFileURL('./'));