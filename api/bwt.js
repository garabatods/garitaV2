module.exports = async (request, response) => {
  try {
    const upstream = await fetch("https://bwt.cbp.gov/xml/bwt.xml");

    if (!upstream.ok) {
      response.status(upstream.status).send("Error fetching data");
      return;
    }

    const xml = await upstream.text();
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    response.status(200).send(xml);
  } catch (error) {
    console.error("Error fetching XML:", error);
    response.status(500).send("Error fetching data");
  }
};
