// This script exports projects from tilda using tilda's private key, public key and project ID
// It first fetches the information about exporting assets, such as css, js files and images
// Then it fetches the information about the pages and downloads its' contents and related assets
// When possible, it also renames the pages to their aliases, to avoid frustrating nginx rewrites
const vorpal = require("vorpal")();

const path = require("path");
const url = require("url");
const axios = require("axios");
const pretty = require("pretty");
const fse = require("fs-extra");
const fs = require("fs");
const chalk = require("chalk");
const sm = require("sitemap");

const log = (text, color) => console.log(chalk[color](text));

const TILDA_BASE_URL = {
  host: "api.tildacdn.info",
  protocol: "https"
};

const headers = {
  Accept: "application/json",
  "Accept-Encoding": "gzip, deflate"
};

const HOME_PAGE_FILENAME = "page4838220.html";
const SCRIPT_DOMAIN = "https://leadza.ai";


const download = async (url, dest) => {
  await fse.ensureDir(path.resolve(dest, "../"));

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    axios({
      method: "GET",
      url,
      responseType: "stream"
    })
      .then(response => {
        response.data.pipe(file);
        file.on("finish", () => {
          file.close(resolve); // close() is async, call cb after close completes.
        });
      })
      .catch(err => {
        // Handle errors
        fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)

        reject(err.message);
      });
  });
};

const getFileName = page => {
  if (page.alias) {
    if (page.alias.includes('/')){
      let path = page.alias.split("/")
      if (!fs.existsSync('./webroot/'+path[0])){
        fs.mkdirSync('./webroot/'+path[0]);
      }
      }
    return `${page.alias}.html`;
  } else if (page.filename === HOME_PAGE_FILENAME) {
    return "index.html";
  }

  return page.filename;
};

const getUrl = page => {
  if (page.alias) {
    return page.alias;
  } else if (page.filename === HOME_PAGE_FILENAME) {
    return "/";
  }

  return page.filename;
};

const generateSitemap = pages => {
  const sitemap = sm.createSitemap({
    hostname: "https://leadza.ai",
    cacheTime: 600000, //600 sec (10 min) cache purge period
    urls: pages
      .filter(page => !page.alias.startsWith("noindex-"))
      .map(page => ({
        url: getUrl(page),
        lastmodISO: new Date().toISOString()
      }))
  });

  return sitemap;
};

vorpal
  .command(
    "export <publicKey> <secretKey> <projectId> [exportDir]",
    "Exports tilda project"
  )
  .action(async (args, callback) => {
    const {
      publicKey: TILDA_PUBLIC_KEY,
      secretKey: TILDA_SECRET_KEY,
      projectId: TILDA_PROJECT_ID,
      exportDir = "./export"
    } = args;

    const BASEDIR = path.resolve(process.cwd(), exportDir);

    try {
      log("Export started!\n", "blue");

      const params = {
        projectid: TILDA_PROJECT_ID,
        publickey: TILDA_PUBLIC_KEY,
        secretkey: TILDA_SECRET_KEY
      };

      log("Fetching export static assets", "yellow");

      const { data: exportInfo } = await axios.get(
        url.format({ ...TILDA_BASE_URL, pathname: "/v1/getprojectexport" }),
        {
          params,
          headers
        }
      );

      log("Export assets fetch success\n", "green");

      const static = [
        ...exportInfo.result.css.map(item => ({
          ...item,
          dir: "css"
        })),
        ...exportInfo.result.js.map(item => ({
          ...item,
          dir: "js"
        })),
        ...exportInfo.result.images.map(item => ({
          ...item,
          dir: "images"
        }))
      ];

      log("Downloading assets\n", "yellow");

      await Promise.all(
        static.map(async file => {
          log(`Downloading ${file.dir} asset ${file.to}`, "blue");

          await download(file.from, path.resolve(BASEDIR, file.dir, file.to));

          log(`Downloaded ${file.dir} asset ${file.to}`, "green");
        })
      );

      log("\nAsset download success\n", "green");

      log("Fetching pages info", "yellow");

      const { data: pagesInfo } = await axios.get(
        url.format({ ...TILDA_BASE_URL, pathname: "/v1/getpageslist" }),
        {
          params,
          headers
        }
      );

      // Generating sitemap

      log("Generating sitemap\n", "yellow");

      const sitemap = generateSitemap(pagesInfo.result);

      await fse.writeFile(
        path.resolve(BASEDIR, "./sitemap.xml"),
        pretty(sitemap.toString(), { otcd: true })
      );

      log("Pages info fetch success\n", "green");

      log("Pages export start\n", "yellow");

      for (const page of pagesInfo.result) {
        log(`Exporting page \"${page.title}\"`, "blue");
        log(`Exporting page \"${page.alias}\"`, "red");

        const fileName = getFileName(page);

        const dir = path.resolve(BASEDIR, fileName);

        log(`Loading page contents`, "yellow");

        const {
          data: { result: pageContents }
        } = await axios.get(
          url.format({ ...TILDA_BASE_URL, pathname: "/v1/getpagefullexport" }),
          {
            params: { ...params, pageid: page.id },
            headers
          }
        );

        log(`Page content load success`, "yellow");

        log(`Saving page as ${fileName}`, "yellow");

        const re = new RegExp(SCRIPT_DOMAIN, "g");
        const regexp   = new RegExp("\<script>([^<]+)\<\/script>", "gm")
        const regexpDefer   = new RegExp("\<script src", "gm")
        const regexpFbAppId   = new RegExp("1654144768160322", "gm")
        let content = pageContents.html && pageContents.html.replace(re, "");
        process.env.NODE_ENV === 'development' ?  content=content.replace(regexpFbAppId,'1835942169980580') : console.log("prod build")

/*
        const fidedScripts =  content.match(regexp)
        content = content.replace(regexp,'')
        content = content.replace(regexpDefer,'<script defer src')
        const scriptList = fidedScripts.join('')
        const boder = /<\/body>/gi;
        content =  content.replace(boder, `${scriptList} <\/body>`);
*/
       await fse.writeFile(dir, content);

        log(`Loading page images\n`, "yellow");

        await Promise.all(
          (pageContents.images || []).map(async file => {
            log(`Downloading image asset ${file.to}`, "blue");

            await download(file.from, path.resolve(BASEDIR, "images", file.to));

            log(`Downloaded image asset ${file.to}`, "green");
          })
        );

        console.log("\n");
      }

      log("All done!", "green");
    } catch (e) {
      log(e, "red");
    }

    callback();
  });

vorpal.parse(process.argv);
