import "ajax-hook"
import "sweetalert2"
import "jsmediatags"

import { router } from './routers'
import { registerMenuCommand } from './registerMenuCommand'
router()
registerMenuCommand()