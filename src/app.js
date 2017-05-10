import todoapp from './templates/todoapp.js'
import * as ef from 'ef.js'

todoapp.$mount({
	target: '.todoapp',
	option: 'replace'
})

window.todoapp = todoapp
window.ef = ef
