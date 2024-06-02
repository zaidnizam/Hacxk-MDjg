
# Hacxk-MD 🤖

A Powerful and Stunning Whatsapp Bot With [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys).

Thank you for supporting Hacxk-MD! 🙏

Your support means the world to us. 🌍

Keep supporting us to bring more exciting features and improvements! 💖

---

## Installation 💻

To get started with Hacxk-MD, follow these steps for various server environments:

## First, Obtain a Session 🔐

Visit the [Hacxk-MD Session Provider(NOT AVAILABLE RIGHT NOW!)](https://github.com/hacxk/Hacxk-MD) and scan the QR code or enter the pairing code. Once completed, the session file will be sent to your paired WhatsApp number. Retrieve that session file.

> [!CAUTION]
>
> If you encounter an "Invalid QR Code" message while scanning, simply restart your NodeJS process.

> [!NOTE]
>
> If a Session folder doesn't exist in your bot, create one. Paste the session file into the created folder.

The next step is hosting.

### Installation on a VPS (e.g., DigitalOcean, AWS, etc.) 🚀

1. **Update your system packages:**

```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js and npm:**

```bash
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Clone the repository:**

```bash
git clone https://github.com/hacxk/Hacxk-MD.git
```

4. **Navigate to the project directory:**

```bash
cd Hacxk-MD
```

5. **Install the dependencies:**

```bash
npm install
```

6. **Start the bot:**

```bash
npm start
```

### Installation on Koyeb ☁️

1. **Create a new application:**

   - Go to your Koyeb dashboard and create a new application.

2. **Select your repository:**

   - Connect your GitHub account and select the Hacxk-MD repository.

3. **Configure the build settings:**

   - Choose the default Node.js build settings.
   - Set the start command to `npm start`.

4. **Deploy the application:**

   - Click on "Deploy" to start the deployment process.

### Installation on Heroku 🌐

1. **Create a new application:**

   - Go to your Heroku dashboard and create a new application.

2. **Deploy using GitHub:**

   - Connect your GitHub repository to Heroku.

3. **Set the buildpack to Node.js:**

   - In the settings tab, add the Node.js buildpack.

4. **Configure environment variables:**

   - Set up any necessary environment variables in the settings tab.

5. **Deploy the application:**

   - Click "Deploy Branch" to deploy your application.

---

## Usage 🚀

After installing the dependencies, you can start the bot using:

```bash
npm install
```

```bash
npm start
```

Ensure you have configured your Whatsapp credentials in the configuration file before starting the bot.

---

### USAGE OF CONFIG COMMAND

## Description

The bot configuration command 🛠️ allows authorized users to dynamically modify the bot's configuration settings. Users can update various settings defined in the `Config.js` file, including owner numbers, bot name, greetings, and more.

### Usage

To use the configuration command, send the following message to the bot:

```
.config <setting> <value>
```

Replace `<setting>` with the name of the setting you want to update and `<value>` with the new value for that setting.

### Examples

Here are some examples to help you get started:

- Change the bot's prefix to `$`:
  ```
  .config botPrefix $
  ```

- Update the bot's name to "MyAwesomeBot":
  ```
  .config botName MyAwesomeBot
  ```

- Enable greetings for new members joining a group:
  ```
  .config greetings true
  ```

- Add a new owner number:
  ```
  .config ownerNumbers +1234567890
  ```

- Remove an owner number:
  ```
  .config ownerNumbers -1234567890
  ```

### Available Settings

Here are the settings that can be modified using the configuration command:

- **botPrefix**: Prefix for bot commands (e.g., `.`, `!`, `#`).
- **botName**: Name of the bot.
- **ownerNumbers**: Array of owner numbers who can modify the bot's configuration.
- **greetings**: Boolean indicating whether greetings are enabled (`true` or `false`).
- **botWorkMode**: Mode of bot operation (e.g., `Private`, `Public`).
- **tempSession**: Boolean indicating whether temporary sessions are enabled (`true` or `false`).
- **adultSearch**: Boolean indicating whether adult content search is enabled (`true` or `false`).
- **directDlLimitinMB**: Maximum download size in MB.
- **Checkers**: Boolean indicating whether various checkers are enabled.
- **AntiLinkChecker**: Boolean indicating whether the anti-link checker is enabled (`true` or `false`).
- **AntiBadWordChecker**: Boolean indicating whether the anti-bad word checker is enabled (`true` or `false`).
- **RejectCall**: Boolean indicating whether calls from unauthorized numbers are rejected (`true` or `false`).

### Notes

- Ensure that you have the necessary permissions to modify the bot's configuration.
- Incorrect usage of the command may result in errors. Follow the provided usage guidelines carefully.
- After updating the configuration, the bot may need to restart to apply the changes.

<details>
<summary><strong>📇 Version History</strong></summary>
<details>
 <summary><strong>🎉 **Hacxk-MD 2.6.1: The WhatsApp Bot Powerhouse!** 🚀</strong></summary>

🎉 **Hacxk-MD 2.6.1: The WhatsApp Bot Powerhouse!** 🚀

Get ready to supercharge your WhatsApp experience with Hacxk-MD's latest release! This update is packed with features that empower you and your groups, while fixing bugs and polishing performance.

✨ **What's New:**

* **Media Maestro:** 
    - **Tiktok Download:** Discover and download trending Tiktok videos directly within WhatsApp. 🎶
    - **Spotify Integration:**  Search and download your favorite Spotify tracks effortlessly. 🎵
* **Group Guru:**
    - **Promote/Demote/Kick:** Manage your group members with ease using simple commands. 💪
    - **Auto Cleanup:** Keep your chats tidy by automatically removing downloaded files. 🧹
* **Under the Hood:**
    - **Bug Fixes:** We've squashed pesky bugs for a smoother experience. 🛠️
    - **Stability Improvements:** Your bot will be even more reliable and responsive. ⚡

💖 **We Value Your Feedback!**

Thank you for your invaluable support and suggestions! Your input is essential in helping us make Hacxk-MD the ultimate WhatsApp bot. 

📣 **Spread the Word:**

Share the joy of AI-powered convenience with your friends and family! Invite them to join the Hacxk-MD community.

🤝 **Connect with Us:**

Stay tuned for future updates and exciting new features! You can find us at:

* **GitHub Repository:** [https://github.com/hacxk/Hacxk-MD](https://github.com/hacxk/Hacxk-MD)

**Technical Details:**

* **Added:** Tiktok search and download functionality, Spotify search and download functionality.
* **Fixed:** Various bugs related to command handling, media processing, and user experience.
* **Improved:** Group management capabilities with promote/demote/kick commands, automatic cleanup of downloaded files.
* **Enhanced:** Overall bot performance and stability.

---

</details>

   
<details>
 <summary><strong>Hacxk-MD V1.1.8: The Unseen Depths</strong></summary>
🎉 Hacxk-MD 1.1.8 is Here! 🚀

### Unleash the Power of a Bot on WhatsApp! 🤖

Your favorite WhatsApp assistant just leveled up! 💪

🎁 **Exciting New Features & Enhancements:**

* **Group Management Pro:** 👑 Take charge of your groups with effortless promote/demote commands.
* **Hacxk-MD is Alive!** 💓 Check in on your bot buddy and see what it's up to.
* **Sticker Mania:** 📸 Transform your photos into fun and expressive stickers in a snap.
* **Bug Zapper:** 🐞 We've squashed those pesky bugs for a smoother, more enjoyable experience.

---
💖 **Your Support Makes Us Shine!**

We couldn't have done it without your incredible feedback and enthusiasm. 🙌  You inspire us to keep making Hacxk-MD the absolute best WhatsApp companion it can be. 

📢 **Share the Love!**

Tell your friends about Hacxk-MD and let them join in on the AI-powered fun! 

🤝 **Connect with Us:**

[[GitHub Repository for Hacxk-MD](https://github.com/hacxk/Hacxk-MD)](https://github.com/hacxk/Hacxk-MD) 

---

🎉 **Together, let's make WhatsApp even more awesome!**
</details>
   
<details>
 <summary><strong>Hacxk-MD v1.1.2: Packed with Bug Fixes</strong></summary>

## 🌟 Hacxk-MD 1.1.2 🚀

### ✨ What's New in Hacxk-MD ✨

- 🛠️ Fixed Session Auto Deletion**
- ⚙️ Added Session Handle**
- 🐛 Fixed Some Main Bugs & Errors**

 </details>

 <details>
 <summary><strong>Hacxk-MD V1.1.0: Packed with New Features</strong></summary>

## Hacxk-MD 1.1.0 🚀

### ✨ What's New in Hacxk-MD ✨

1. 🎥 **Fixed YouTube Video Downloader**
2. 🎞️ **Added YouTube Video HD Downloader** (Limited File Size)
3. 🎵 **Added YouTube Audio Downloader**
4. 📶 **Added Ping Command**
5. 🎬 **Added TikTok Video/Audio HD/SD Downloader Without Watermark**
6. 🔄 **Added Always Online** (Every 25 Minutes Bot Will Restart for Better Performance)

 </details>

</details>

## License 📝

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact 📧

For any inquiries or support, please contact us at support@hacxk-md.com.

Thank you for using Hacxk-MD! If you enjoy the bot, please consider giving us a star on GitHub. ⭐

---


