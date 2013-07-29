Installing the TicTacToe App in Eclipse

The goal of this sample is to show developers how to use the Google Cast
technology, and not to demonstrate Android programming best practices. 

For more information on Android best practices, please see
http://developer.android.com/training.index.html.

Before you Start:

1. You should already have Eclipse set up with the Android SDK. If not, go to 
http://developer.android.com/sdk/installing/index.html and follow the 
instructions there.

2. You should have the Cast SDK and all necessary support libraries installed.
For instructions on installation, go to developers.google.com/cast, or see the
included INSTALL_CAST_ECLIPSE.txt.

2. OPTIONAL: Your app name and receiver URLs should be whitelisted, so that if
you want to upload your own copy of the receiver, the Cast will know where to
find your receiver app. If you're not sure how to do this, go to 
developers.google.com/cast/whitelisting for instructions.

Contents

A. Installing the TicTacToe App
B. Casting to the Receiver
C. Common Errors

***

A. Installing the TicTacToe App

This section describes how to set up the TicTacToe App as a project within
your Eclipse workspace.

1. In Eclipse, go to File->Import... and select Android->Existing Android Code
   into Workspace.
2. In the resulting Import Projects dialog, browse to the directory you
   unzipped the files into and set that as your root directory.
   OPTIONAL BUT RECOMMENDED: 
      1. Set New Project Name to something that describes the project, such as 
         "CastTicTacToeApp".
      2. Check "Copy Projects into Workspace".
3. Hit Finish. The project you just created should show up in your workspace,
   with errors if you don't have the Cast SDK and support libraries configured.
   See developers.google.com/cast for up-to-date installation instructions.
4. If no errors pop up, the demo project is ready to be run.

***

B. Casting to the Receiver

In GameActivity at line 91, the code makes a call to the app name "TicTacToe".
This is a whitelisted app name at which the TicTacToe receiver is located, so
you can simply build and run the app without worrying about whitelisting your
own receiver.

OPTIONAL: Setting up Your Own Receiver

Instead of using the TicTacToe receiver, you can upload your own receiver copy
so that you can cast to it or optionally modify its behavior. You must already
have a whitelisted receiver URL (your_domain.com/your_receiver_name.html)
which you can replace with the TicTacToe App's receiver.

1. In the /receiver folder, you'll find board.js, tictactoe.js, tictactoe.png,
and tictactoe.html. Rename tictactoe.html to the name of your whitelisted 
receiver, and upload all four files to your whitelisted directory.
2. At line 91 of GameActivity, replace "TicTacToe" with your own AppID.
3. Run the TicTacToe app; you should now be able to connect to your own version
of the TicTacToe receiver.

***

C. Common Errors

My personal TicTacToe receiver app doesn't show up/function!
1. Make sure you replaced "TicTacToe" with your own AppID at line 91 of
GameActivity.
2. Make sure you uploaded all four files in the /receiver folder to the URL
associated with your app, and check that tictactoe.html has been renamed to
your receiver name.
3. After doing so, force close your current instance of the TicTacToe app,
then compile and run again.

