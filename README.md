# Sign PDF Online: write your signature on the page like a pen

**[Sign a PDF online](https://toolster.net/sign_pdf)**. Free, no sign-up, the PDF stays on your device and is not uploaded.

![Sign PDF online](screenshot.png)

Open a PDF and sign right on the page, the way you sign paper with a pen. There is no signature to create first and no windows to click through: the pen is ready the moment the file opens.

## Features

- The pen is on as soon as the PDF opens: write your signature where it belongs
- Dark blue ink like a ballpoint, black one click away, smoothing for a shaky mouse
- **Text** mode for your name, a title or any note next to the signature
- Right-click the page and pick **Insert here**: a saved signature, a text, **Today's date** or **Draw a signature** in a large box
- Every signature and text you make waits in the **Quick insert** row next time, nothing to set up
- Move, resize and recolor what you added, or repeat it in the same spot on every page
- Works on a phone: tap the spot, sign with your finger, tap Done
- **Save PDF** downloads a copy with `-signed` at the end of its name; the text of the document stays selectable

## How to sign a PDF

1. Open **[Sign PDF](https://toolster.net/sign_pdf)** and drop the file onto the box or press **Choose PDF**.
2. The blue pen is already on. Write your signature on the line.
3. Need a name or a date? Pick **Text** and type, or right-click the page and choose **Today's date**.
4. Press **Save PDF**. The signed copy is downloaded next to the original.

## What people use it for

- A school permission slip or a consent form
- A lease or a rental agreement
- A freelance contract, an invoice or an application
- Any PDF that came with "please sign and send it back"

## Video

- [How to sign a PDF online, short walkthrough](https://youtu.be/AwkxxrwQrBw)

## Helper scripts

Small Node.js scripts, no dependencies (Node 18+):

```bash
node scripts/make-sign-form.js form.pdf --title "Field trip permission"   # blank practice form
node scripts/signing-receipt.js lease.pdf lease-signed.pdf receipt.json    # receipt for a signed copy
npm test
```

`make-sign-form.js` makes a one-page form with lines for a name, a date and a signature (add `--a4` for A4), so you can try signing before the real document. `signing-receipt.js` writes a short JSON note with the SHA-256 fingerprints, sizes and page counts of the original and the signed copy, plus the time. Keep it with the files and you can always tell which version you signed and sent. It warns if the signed copy is identical to the original or has a different number of pages.

## More

- [About Sign PDF](ABOUT.md): signing like on paper, Quick insert, phones, privacy
- Other languages: [Подписать PDF (RU)](https://ru.toolster.net/sign_pdf), [Firmar PDF (ES)](https://es.toolster.net/sign_pdf)
- 240+ free browser tools: [toolster.net](https://toolster.net)

Found a bug or want a feature? [Open an issue](../../issues).

The signer itself is a hosted web app, its source code is not published here. The helper scripts are MIT licensed.
