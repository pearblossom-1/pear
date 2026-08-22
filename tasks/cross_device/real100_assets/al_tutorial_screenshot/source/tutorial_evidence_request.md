Tutorial evidence request
Use the row in this note where page=linux-basics and status=needed.

page,working_directory,command,status
linux-basics,/tmp/tutorial/linux-basics,pwd && printf 'shell=%s\n' "${SHELL:-/bin/sh}" && wc -c < tutorial_input.txt && sha256sum tutorial_input.txt,needed
linux-basics,/tmp/tutorial/linux-basics,printf 'draft example\n',draft
shell-advanced,/tmp/tutorial,find . -maxdepth 1 -type f -print,needed
linux-basics,/tmp/old_tutorial,printf 'archived example\n',archived
