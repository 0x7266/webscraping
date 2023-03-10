const fs = require("fs");
const axios = require("axios");
const { load } = require("cheerio");
const subreddit = "unixporn";
const url = `https://old.reddit.com/r/${subreddit}/new`;
let posts = [];
let page = 1; /*testing*/

async function getImage(postLink) {
  const { data } = await axios(postLink);
  const $ = load(data);
  return $("a.post-link").attr("href");
}

(async function run(url) {
  try {
    console.log(url);
    const { data } = await axios(url);
    const $ = load(data);
    $(".thing.link").each(async (i, e) => {
      const title = $(e)
        .find(".entry.unvoted .top-matter .title .title")
        .text();
      const user = $(e)
        .find(".entry.unvoted .top-matter .tagline .author")
        .text();
      const profileLink = `https://old.reddit.com/user/${user}`;
      const postLink = `https://old.reddit.com/${$(e).find("a").attr("href")}`;
      // const thumbail = $(e).find("a img").attr("src");
      const image = await getImage(postLink);
      posts.push({
        id: i + 1,
        title,
        postLink,
        image,
        user: { user, profileLink },
      });
      page++; /*testing*/
    });
    const nextPage = $(".next-button a").attr("href");
    if (page <= 2) {
      /*testing*/
      await run(nextPage); /*testing*/
      // if (nextPage) {
      //   await run(nextPage);
    } else {
      console.log(posts.sort((a, b) => a.id - b.id));
      fs.writeFileSync(
        `./data/${subreddit}.json`,
        JSON.stringify(posts.sort((a, b) => a.id - b.id))
      );
    }
  } catch (error) {
    console.error(error);
  }
})(url);
