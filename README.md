# TrailCam
TrailCam is a web application that processes emails sent by a trail camera and shows the received pictures/videos and other relevant information to the user in chronological order.

The project is still work in progress. This README will be updated with further details when v1 is released.

## Project status

The aim for v1 is to have:
- User login/logout
- Infinite scroll, in chronological order, of all recordings received
- Detailed view of each recording
- Processing of the emails received from the trail camera
  - Extraction information from the email, including parsing of the email body
  - Generation of thumbnail versions of the pictures and videos received

Most of the above are already working, with the exception of the thumbnail generation, which is the current ongoing task.

Other features to be implemented later on:
- Password recovery
- Creation of new users
- Tagging of recordings
- Deletion of recordings
- Possibility to filter and sort the recording list

## Technologies used

- Back end implemented in NodeJS.
- Front end implemented in React.
- MongoDB as database.
- AWS S3 used for storage of pictures and videos.

## License

This project is licensed under the terms of the [ISC](https://opensource.org/licenses/ISC) license.