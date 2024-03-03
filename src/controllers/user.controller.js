import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";

import { uploadCloudinary } from "../utils/cloudnary.js";
import jwt from 'jsonwebtoken'

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the access and refresh tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  //check if user alrady exists : username,email
  // check for images ,check for avatar
  // upload them to cloudinary , avatar
  // create user object - create entry in db
  // remove password and refresh token field form response
  // check for user creation 
  // return res

  const { fullname, email, username, password } = req.body

  if ([fullname, email, username, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  console.log(req.files?.avatar[0]?.path);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath.length) {
    throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadCloudinary(avatarLocalPath)



  let coverImage;
  if (coverImage !== undefined || coverImage !== null) {
    coverImage = await uploadCloudinary(coverImageLocalPath)
  }



  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

  const user = await User.create(
    {
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    }
  )

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  console.log(createdUser)


  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the User")
  }


  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

});


const loginUser = asyncHandler(async (req, res) => {
  // get the data from req body (req body->data)
  //username or email
  //find the user
  // password check
  // access token and refresh token
  // send cookies


  console.log(JSON.stringify(req.body));

  const { email, username, password } = req.body




  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required")
  }

  // const user = await User.findOne({
  //   $or: [{ username, email }]
  // })

  const user = await User.findOne({
    $or: [
      { username: { $in: [username] } },
      { email: { $in: [email] } }
    ]
  });

  console.log(`User is >> ${user}`);

  if (!user) {
    throw new ApiError(400, "User doesn't exist")
  }


  const isPasswordValid = await user.isPasswordCorrect(password)


  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)




  const loggedInUser = await User.findById(user._id).select('-password -refreshToken')



  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken
      },
      "User Logged in successfully"
    )
  )

})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }
  }
    , {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, rs) => {
  const incommingRefreshToken = await req.cookie.refreshToken || req.body.refreshToken
  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unauthorized access")
  }

  try {
    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (decodedToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true,
    }

    const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    return res.status(200).cookie('accessToken', accessToken).cookie('refreshToken', newRefreshToken).json(
      new ApiResponse(
        200,
        { accessToken, refreshAccessToken: newRefreshToken },
        "Access token refreshed succesfully"

      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message)

  }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req?.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  )

})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "Current user fetched succefully")
})


const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { fullname, email }
  }, { new: true }).select('-password')

  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path()
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }
  const newAvatar = await uploadCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findOneAndUpdate(req.user?._id, {
    $set: {
      avatar: newAvatar.url
    }
  }, { new: true }).select('-password')
  return res.status(200).json(
    new ApiResponse(200, user, "avatar updated successfull")
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImage = req.file?.path()
  if (!coverImage) {
    throw new ApiError(400, "Cover image file is missing")
  }
  const newCoverImage = await uploadCloudinary(coverImage)
  if (!newCoverImage.url) {
    throw new ApiError(400, "Error while uploading cover image")
  }

  const user = await User.findOneAndUpdate(req.user?._id, {
    $set: {
      coverImage: newCoverImage.url
    }
  }, { new: true }).select('-password')

  return res.status(200).json(
    new ApiResponse(200, user, "Cover image updated successfull")
  )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccoutDetails, updateUserAvatar, updateUserCoverImage };
