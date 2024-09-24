const mongoose = require("mongoose");
const Loc = mongoose.model("Location");

// Read a single review
const reviewsReadOne = async (req, res) => {
  try {
    const location = await Loc.findById(req.params.locationid).select(
      "name reviews"
    );

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(req.params.reviewid);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      const response = {
        location: {
          name: location.name,
          id: req.params.locationid,
        },
        review,
      };
      return res.status(200).json(response);
    } else {
      return res.status(404).json({ message: "No reviews found" });
    }
  } catch (err) {
    return res.status(400).json(err); // Handle any errors
  }
};

// Helper function to add a review
const doAddReview = async (req, res, location) => {
  if (!location) {
    return res.status(404).json({ message: "Location not found" });
  }

  location.reviews.push({
    author: req.body.author,
    rating: req.body.rating,
    reviewText: req.body.reviewText,
  });

  try {
    const updatedLocation = await location.save();
    updateAverageRating(updatedLocation._id); // Function to update average rating
    const newReview =
      updatedLocation.reviews[updatedLocation.reviews.length - 1];
    return res.status(201).json(newReview); // Return the newly created review
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Create a new review
const reviewsCreate = async (req, res) => {
  const locationId = req.params.locationid;

  if (!locationId) {
    return res.status(404).json({ message: "Location not found" });
  }

  try {
    const location = await Loc.findById(locationId).select("reviews");

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    await doAddReview(req, res, location); // Call the helper function to add a review
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Update an existing review
const reviewsUpdateOne = async (req, res) => {
  const { locationid, reviewid } = req.params;

  if (!locationid || !reviewid) {
    return res
      .status(404)
      .json({ message: "locationid and reviewid are both required" });
  }

  try {
    const location = await Loc.findById(locationid).select("reviews");

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(reviewid);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Update the review fields
      review.author = req.body.author;
      review.rating = req.body.rating;
      review.reviewText = req.body.reviewText;

      // Save the updated location
      await location.save();
      updateAverageRating(location._id); // Update the average rating
      return res.status(200).json(review); // Respond with the updated review
    } else {
      return res.status(404).json({ message: "No review to update" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Delete a review
const reviewsDeleteOne = async (req, res) => {
  const { locationid, reviewid } = req.params;

  if (!locationid || !reviewid) {
    return res
      .status(404)
      .json({ message: "locationid and reviewid are both required" });
  }

  try {
    const location = await Loc.findById(locationid).select("reviews");

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(reviewid);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      review.remove(); // Remove the review
      await location.save();
      updateAverageRating(location._id); // Update the average rating
      return res.status(204).json(null); // Successfully deleted
    } else {
      return res.status(404).json({ message: "No review to delete" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports = {
  reviewsReadOne,
  reviewsCreate,
  reviewsUpdateOne,
  reviewsDeleteOne,
};