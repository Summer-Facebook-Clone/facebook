FRONT END:
	-HTML
•	Code all designs on the html pages already made. Other pages will be needed the bottom are just pages that give you example of most of the criteria that need pages and need to be touched.
o	Index.html: main page the first page that is loaded when opened.
o	EditingProfile.html: page that you have access to and shows all data that can be changed.
o	Post.html: what a post would look like on the page or multiple posts when scrolling, be as creative as you want.
o	Posting.html: what a creating a post page looks like from the selecting photos to adding caption.
o	Profile.html: what the profile page will look like, bio, description, story, followers, and as well as all the posts on your account.
o	Search.html: page that searches through a query inserted by the user and will show desired results how everything will be showed.
o	Settings.html: page with settings that can be changed to personalize your account and keep your account safe, such as 2FA, password change, or even username change.
o	TextMessage.html: page where you can see all the messages and individual text messages.
•	Later when more developpe we can transfer all the data into a react app, so it is more modular.

	-CSS
•	Global.css: page with global css, @media tags, colors of page simple font, sizing of text etc.

•	Create page specific css files for individual designs so the conflict is merged and screws up the other html css. Therefore, all pages share one common and have their own css files.

	-JAVASCRIPT
•	Animations for Website

•	Displaying DOM

BACK END:
•	User Authentication
o	Login
o	Hashing
o	Sign Up
o	Forget Password
o	2FA

•	Posting Story

•	Posting Post

•	Editing Profile

•	Editing Settings

•	Searching Through Accounts

•	Searching Through Hashtags

•	Sending Messages

•	Creating Group Chats

•	Liking and Commenting on Posts

•	Saving / Bookmarking Post

DATABASE:
•	User
o   __Id
o	Username
o	Password
o	Email
o	CreatedAt
o	UpdatedAt
o	__V

•	Posts
o	__PostId
o	(Collection) Comments
o	PostedAt
o	Username

•	Profile
o	Picture
o	Bio
o	Username
o	NumPosts
o	NumFollowers
o	NumFollowing
o	(ForeignKey) PostId

•	Story
o	__StoryId
o	CreatedAt
o	Media

