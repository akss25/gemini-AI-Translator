const { History } = require("./model");

const SaveHistory = (response) => {
  // Ensure `response` is an object
  if (typeof response === "object" && response !== null) {
    const historyToSave = new History(response);

    historyToSave.save(historyToSave);
  }
};

const getHistory = async (req, res) => {
  try {
    console.log("In history");
    const history = await History.find();
    console.log(history); // Retrieves all documents from the History collection
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving history" });
  }
};

module.exports = { SaveHistory, getHistory };
