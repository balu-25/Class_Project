const mongoose = require("mongoose");
const Loc = mongoose.model("Location");

// Create a new location
const locationsCreate = async (req, res) => {
  try {
    const location = await Loc.create({
      name: req.body.name,
      address: req.body.address,
      facilities: req.body.facilities.split(","),
      coords: {
        type: "Point",
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      },
      openingTimes: [
        {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        },
      ],
    });
    res.status(201).json(location); // Return the created location document
  } catch (err) {
    res.status(400).json(err); // Handle errors during creation
  }
};

// List locations by distance using GeoJSON
const locationsListByDistance = async (req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);

  if (!lng || !lat) {
    return res
      .status(400)
      .json({ message: "lng and lat query parameters are required" });
  }

  const near = {
    type: "Point",
    coordinates: [lng, lat],
  };

  const geoOptions = {
    distanceField: "distance.calculated",
    key: "coords",
    spherical: true,
    maxDistance: 20000, // Example max distance (in meters)
    limit: 10, // Limit results to 10 locations
  };

  try {
    const results = await Loc.aggregate([
      { $geoNear: { near, ...geoOptions } },
    ]);

    const locations = results.map((result) => ({
      id: result._id,
      name: result.name,
      address: result.address,
      rating: result.rating,
      facilities: result.facilities,
      distance: `${result.distance.calculated.toFixed()}m`,
    }));

    res.status(200).json(locations); // Return the list of locations
  } catch (err) {
    res.status(404).json(err); // Handle errors
  }
};

// Read a specific location by ID
const locationsReadOne = async (req, res) => {
  const { locationid } = req.params;

  if (!locationid) {
    return res.status(400).json({ message: "locationid is required" });
  }

  try {
    const location = await Loc.findById(locationid).select(
      "name address reviews"
    );

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (err) {
    res.status(400).json(err); // Handle errors
  }
};

// Update a location by ID
const locationsUpdateOne = async (req, res) => {
  const { locationid } = req.params;

  if (!locationid) {
    return res.status(400).json({ message: "locationid is required" });
  }

  try {
    const location = await Loc.findById(locationid).select("-reviews -rating");

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Update fields
    location.name = req.body.name;
    location.address = req.body.address;
    location.facilities = req.body.facilities.split(",");
    location.coords = {
      type: "Point",
      coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    };
    location.openingTimes = [
      {
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
      },
      {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2,
      },
    ];

    // Save the updated location document
    const updatedLocation = await location.save();
    res.status(200).json(updatedLocation);
  } catch (err) {
    res.status(400).json(err); // Handle errors
  }
};

// Delete a location by ID
const locationsDeleteOne = async (req, res) => {
  const { locationid } = req.params;

  if (!locationid) {
    return res.status(400).json({ message: "locationid is required" });
  }

  try {
    const location = await Loc.findByIdAndDelete(locationid);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(204).json(null); // Successfully deleted
  } catch (err) {
    res.status(400).json(err); // Handle errors
  }
};

module.exports = {
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne,
};