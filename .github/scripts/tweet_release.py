import os
import sys
import tweepy

API_KEY = os.environ["X_CONSUMER_KEY"]
API_SECRET = os.environ["X_CONSUMER_SECRET"]
ACCESS_TOKEN = os.environ["X_ACCESS_TOKEN"]
ACCESS_SECRET = os.environ["X_ACCESS_TOKEN_SECRET"]

release_tag = os.environ.get("RELEASE_TAG", "")
release_name = os.environ.get("RELEASE_NAME", release_tag)
release_url = os.environ.get("RELEASE_URL", "")
release_body = os.environ.get("RELEASE_BODY", "")

# Build tweet text
headline = f"🚀 {release_name} of @echosdk/react is out!"

highlights = ""
if release_body:
    lines = [
        line.strip()
        for line in release_body.splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    if lines:
        top = lines[:2]
        highlights = "\n" + "\n".join(f"• {l.lstrip('-').strip()}" for l in top)

footer = (
    "\n\nIntegrate AI support chat into your React app with a single component."
    "\nnpm install @echosdk/react"
    f"\n🔗 {release_url}"
    "\n#React #OpenSource #AI"
)

tweet = headline + highlights + footer

# Truncate safely to 280 chars
if len(tweet) > 280:
    overflow = len(tweet) - 280
    if highlights:
        highlights = highlights[: len(highlights) - overflow - 3] + "…"
        tweet = headline + highlights + footer
    if len(tweet) > 280:
        tweet = tweet[:277] + "…"

client = tweepy.Client(
    consumer_key=API_KEY,
    consumer_secret=API_SECRET,
    access_token=ACCESS_TOKEN,
    access_token_secret=ACCESS_SECRET,
)

response = client.create_tweet(text=tweet)
print(f"Tweet posted! ID: {response.data['id']}")
print(f"Content:\n{tweet}")
