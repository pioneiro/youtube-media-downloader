import express from "express";
import ytdl from "ytdl-core";

const PORT = process.env.PORT || 5192;

const index = express();

index.set("view engine", "ejs");

index.use(express.static("assets"));
index.use(express.urlencoded({ extended: true }));

index.get("/", (req, res) => {
	res.render("index");
});

index.post("/getdata", (req, res) => {
	ytdl
		.getInfo(req.body.videoURL)
		.then((info) => {
			const title = info.videoDetails.title;

			const options = info.formats
				.filter((e) => e.hasAudio === true)
				.sort((a, b) => (a.mimeType > b.mimeType ? 1 : -1));

			res.render("download", {
				thumbnail:
					info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
						.url,
				url: req.body.videoURL,
				title: title,
				options: options,
			});
		})
		.catch((error) => {
			console.log(error);
			res.send("Error");
		});
});

index.post("/download", (req, res) => {
	ytdl
		.getInfo(req.body.videoURL)
		.then((info) => {
			const format = ytdl.chooseFormat(info.formats, {
				quality: req.body.avid,
			});

			const ext = format.hasVideo === true ? ".mp4" : ".mp3";

			const fileName =
				info.videoDetails.title +
				(ext === ".mp4" ? ` ${format.qualityLabel}` : "") +
				ext;

			res.header("Content-Disposition", `attachment;\ filename="${fileName}"`);

			ytdl.downloadFromInfo(info, { quality: req.body.avid }).pipe(res);
		})
		.catch((error) => {
			console.log(error);
			res.send("Error");
		});
});

index.listen(PORT, () => {
	console.log(`Server initiated at port ${PORT}`);
});
