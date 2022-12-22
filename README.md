# FileUploadServer

Fileuploadserver (working title) is an Express middleware file uploading module,
developed by Abe for the 9-de online.

This middleware can be found in the `module` folder. In `example_project` you
can find an example Express app using FileUploadServer. For your own project, it
is recommended to clone this whole repository, and compile against it form a
folder outside of the fileuploadserver.

To set things up the first time:
1. run `install.sh`
1. when it crashes, you may have missing dependencies (`tsc`, ...)
1. read and then run `compile_and_run_example.sh` if it looks good

I've gone slightly over budget - spent 48 hours developing this.

Features:
- modular design for easy integration with Express apps
- handles and communicates most failure modes with the user
- easily extendable if more features are needed in the future
- simple UI keeps users up to date on the upload progress
- can handle multiple uploads at once, short network interuptions
- has simple logging system
- uploaded files are given nice(?) names
- tested on firefox and chrome, works correctly over (very) slow connections
- no duplicate code - no copy pasting html, css or javascript that goes out of sync
- can run as part of an existing express app, or on its own thread
- light weight: low data and cpu overhead in the client
- the included example project has a simple rate limiter that can blunt simple denial of service attacks
- user inputs are sanitized
- has "only a few" dependencies (a few hundred is not a lot for the node world)

Non-features:
- not extensively battle tested
  - not tested on old browser versions
  - not tested on old server (linux) versions
  - not stress-tested with many users at once (but expect this to work)
  - not tested with long uptimes (may need wrapper for restarts)
- no guarantee that there are no security problems
- no (unit) tests
- the user interface allows only one file at a time (but can easily be extended to allow multiple)
- does not yet avoid overfilling the filesystem with uploads

The TODOs file lists some of the things that could be nice to have in the future. If you want a
full overview of the features and/or known problems, be sure to ask me.

This project was tested, but I'm sure running this in production will reveal
some problems. Feel free to ask me about the setup and/or problems encountered.

Groetjes :D
