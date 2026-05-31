// PR-29 — typed API error.
package com.forge.mawaqitmasjid.models

sealed class ApiError(val reason: String) : Throwable(reason) {
    data class Transport(val detail: String) : ApiError("Network error: $detail")
    object Unauthorized : ApiError("Please sign in again.")
    object NotFound : ApiError("Requested resource not found.")
    data class Server(val code: Int, val detail: String) : ApiError("Server error $code: $detail")
    data class Decoding(val detail: String) : ApiError("Response could not be decoded: $detail")
    object Offline : ApiError("No internet connection.")
}

sealed class ApiResult<out T> {
    data class Success<T>(val value: T) : ApiResult<T>()
    data class Failure(val error: ApiError) : ApiResult<Nothing>()
}
