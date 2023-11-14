import axios from "axios";
import config from "@/config.json";
let baseUrl = config.apiBaseUrl;
import multipartFileUpload from "@/utils/multipartFileUpload";

export default {
  async getComicsPaginated({
    categories,
    tags,
    keywordIds,
    search,
    order,
    page,
  }) {
    let params = {
      page: page || 1,
      order,
    };
    if (categories) {
      params.categories = categories;
    }
    if (tags) {
      params.tags = tags;
    }
    if (keywordIds && keywordIds.length > 0) {
      params.keywordIds = keywordIds;
    }
    if (search) {
      params.search = search;
    }

    let response = await axios.get(baseUrl + "/comicsPaginated", { params });
    for (var comic of response.data.comics) {
      comic.created = new Date(comic.created);
      comic.updated = new Date(comic.updated);
    }

    return response.data;
  },

  async getAllComics() {
    let pageSize = 800;
    let allResponseData = [];
    let hasNextPage = true;
    let page = 1;

    while (hasNextPage) {
      let offset = (page - 1) * pageSize;
      let response = await axios.get(`${baseUrl}/all-comics`, {
        params: { offset, limit: pageSize },
      });
      allResponseData = allResponseData.concat(response.data);
      hasNextPage = response.data.length === pageSize;
      page++;
    }

    return allResponseData;
  },

  async getComic(comicName) {
    let response = await axios.get(baseUrl + "/comics/" + comicName);
    return response.data;
  },

  async getPendingComics() {
    let response = await axios.get(baseUrl + "/pendingcomics");
    if (!response.data.error) {
      return response.data;
    } else {
      return [];
    }
  },

  async getPendingComic(comicName) {
    let response = await axios.get(baseUrl + "/pendingComics/" + comicName);
    if (!response.data.error) {
      return { success: true, result: response.data };
    } else {
      return { success: false, message: response.data.error };
    }
  },

  async getSuggestedComicList() {
    let response = await axios.get(baseUrl + "/comicsuggestions");
    if (!response.data.error) {
      return response.data;
    } else {
      return [];
    }
  },

  async getRejectedComics() {
    let response = await axios.get(baseUrl + "/comicsuggestions/rejected");
    if (!response.data.error) {
      return response.data;
    } else {
      return [];
    }
  },

  async updateComic(updatedComicData) {
    let response = await axios.post(
      `${baseUrl}/comics/${updatedComicData.id}/updatedetails`,
      updatedComicData
    );
    if (!response.data.error) {
      return { success: true };
    } else {
      return { success: false, message: response.data.error };
    }
  },

  async addNewComic(
    comicData,
    pageFiles,
    thumbnailFile,
    reportProgressPercentFunc
  ) {
    let regularFieldsWithNames = Object.entries(comicData);

    let filesWithNames = [];
    if (thumbnailFile) {
      filesWithNames.push(["thumbnailFile", thumbnailFile]);
    }
    for (var pageFile of pageFiles) {
      filesWithNames.push(["pageFile", pageFile]);
    }

    await multipartFileUpload(
      regularFieldsWithNames,
      filesWithNames,
      baseUrl + "/comics",
      reportProgressPercentFunc
    );

    return;
  },

  async addThumbnailToPendingComic(comicData, thumbnailImage) {
    let formData = new FormData();
    formData.append("thumbnailFile", thumbnailImage);
    formData.append("comicName", comicData.name);

    let response = await axios.post(
      `${baseUrl}/pendingcomics/${comicData.id}/addthumbnail`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    if (!response.data.error) {
      return { success: true };
    } else {
      return { success: false, message: response.data.error };
    }
  },

  async updatePendingComicData(
    comicId,
    comicName,
    artistId,
    cat,
    tag,
    state,
    nextComic,
    previousComic
  ) {
    try {
      let body = {
        comicName,
        artistId,
        cat,
        tag,
        state,
        nextComic,
        previousComic,
      };

      await axios.put(`${baseUrl}/pendingcomics/${comicId}`, body);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data || "Unknown error updating comic data",
      };
    }
  },

  async addPagesToComic(comicData, newPagesList, progressFunction) {
    let formData = new FormData();
    formData.append("comicName", comicData.name);
    for (var file of newPagesList) {
      formData.append("newPages", file);
    }

    await axios.post(`${baseUrl}/comics/${comicData.id}/addpages`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => progressFunction(progressEvent),
    });

    return;
  },

  async uploadPendingComicPages(
    mode,
    comicData,
    newPagesList,
    progressFunction
  ) {
    let formData = new FormData();
    formData.append("comicName", comicData.name);
    for (var newPageFile of newPagesList) {
      formData.append("newPages", newPageFile);
    }

    let response = await axios.post(
      `${baseUrl}/pendingcomics/${comicData.id}/${mode}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => progressFunction(progressEvent),
      }
    );
    if (!response.data.error) {
      return { success: true };
    } else {
      return { success: false, message: response.data.error };
    }
  },

  async processComicSuggestion(suggestionId, suggestionData) {
    let response = await axios.post(
      `${baseUrl}/comicsuggestions/${suggestionId}/process`,
      suggestionData
    );
    if (!response.data.error) {
      return { success: true };
    } else {
      return { success: false, message: response.data.error };
    }
  },

  async processPendingComic(comicId, isApproved) {
    let response = await axios.post(baseUrl + "/pendingcomics/" + comicId, {
      isApproved: isApproved,
    });
    if (response.data.error) {
      return { success: false, message: response.data.error };
    }
    if (!response.data.error) {
      return { success: true };
    }
  },

  async schedulePendingComic(comicId, scheduledTime) {
    try {
      await axios.post(`${baseUrl}/pendingcomics/${comicId}/schedule`, {
        scheduledTime,
      });
      return true;
    } catch (err) {
      return { error: err?.response?.data || "Unknown error scheduling comic" };
    }
  },

  async setPendingComicNeedingFix(comicId, errorText) {
    try {
      await axios.patch(`${baseUrl}/pendingcomics/${comicId}/set-error`, {
        errorText: errorText,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data || "Unknown error updating comic data",
      };
    }
  },

  async rateComic(comicId, newRating) {
    let response = await axios.post(`${baseUrl}/comics/${comicId}/rate`, {
      rating: newRating,
    });
    if (response.data.error) {
      return { success: false, message: response.data.error };
    }
    if (!response.data.error) {
      return { success: true };
    }
  },

  async addComicSuggestion(comicName, artist, linksComments) {
    let response = await axios.post(baseUrl + "/comicsuggestions", {
      comicName: comicName,
      artist: artist,
      comment: linksComments,
    });
    return response.data;
  },

  async swapComicPages(comicName, comicId, pageNumber1, pageNumber2) {
    let response = await axios.post(baseUrl + "/swapcomicpages", {
      comicName: comicName,
      comicId: comicId,
      pageNumber1: pageNumber1,
      pageNumber2: pageNumber2,
    });
    if (response.data.error) {
      return { success: false, message: response.data.error };
    }
    if (!response.data.error) {
      return { success: true };
    }
  },

  async insertComicPage(
    comicName,
    comicId,
    imageFile,
    insertAfterPageNumber,
    progressFunction,
    isPendingComic
  ) {
    let formData = new FormData();
    formData.append("comicName", comicName);
    formData.append("comicId", comicId);
    formData.append("insertAfterPageNumber", insertAfterPageNumber);
    formData.append("isPendingComic", isPendingComic);
    formData.append("newPageFile", imageFile);

    await axios.post(baseUrl + "/insertcomicpage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => progressFunction(progressEvent),
    });

    return;
  },

  async autoResizeComic(comicId) {
    try {
      let response = await axios.post(
        `${baseUrl}/comics/${comicId}/auto-resize`
      );
      return response.data;
    } catch (err) {
      return { error: err?.response?.data || "Unknown error resizing comic" };
    }
  },

  async deleteComic(comicId) {
    try {
      let response = await axios.delete(`${baseUrl}/comics/${comicId}`);
      return response.data;
    } catch (err) {
      return { error: err?.response?.data };
    }
  },

  async deleteComicPage(
    comicName,
    comicId,
    pageNumber,
    isPendingComic = false
  ) {
    //todo MOVE OUT OF HERE, TO MISC
    let response = await axios.post(baseUrl + "/deletecomicpage", {
      comicName: comicName,
      comicId: comicId,
      pageNumber: pageNumber,
      isPendingComic: isPendingComic,
    });
    if (response.data.error) {
      return { success: false, message: response.data.error };
    }
    if (!response.data.error) {
      return { success: true };
    }
  },

  async replaceThumbnailImage(comicName, comicId, thumbnailFile) {
    let formData = new FormData();
    formData.append("comicName", comicName);
    formData.append("comicId", comicId);
    formData.append("thumbnailFile", thumbnailFile);

    let response = await axios.post(
      `${baseUrl}/comics/${comicId}/addthumbnail`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (response.data.error) {
      return { success: false, message: response.data.error };
    }
    if (!response.data.error) {
      return { success: true };
    }
  },
};
