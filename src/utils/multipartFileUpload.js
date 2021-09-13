import config from '@/config.json'
import axios from 'axios'

function generateRandomLetterString(length) {
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopq'
  let returnString = ''
  for (let i=0; i<length; i++) {
    returnString += letters.charAt(Math.floor(Math.random()*letters.length))
  }
  return returnString
}

export default async function multipartUpload (
  regularFieldsWithNames,
  filesWithNames,
  url,
  reportProgressPercentFunc
) {
  let allRequestBodies = []
  let currentFormData = new FormData()

  for (let [fieldKey, fieldVal] of regularFieldsWithNames) {
    if (typeof fieldVal === 'object' && fieldVal !== null) {
      fieldVal = JSON.stringify(fieldVal)
    }
    currentFormData.append(fieldKey, fieldVal)
  }
  let currentBatchSize = 0

  for (let [formKey, file] of filesWithNames) {
    // If exceeding limit, add new body
    if (currentBatchSize + file.size > config.maxUploadSizeMB * 1000000) {
      allRequestBodies.push(currentFormData)
      currentFormData = new FormData()
      for (let [fieldKey, fieldVal] of regularFieldsWithNames) {
        if (typeof fieldVal === 'object' && fieldVal !== null) {
          fieldVal = JSON.stringify(fieldVal)
        }
        currentFormData.append(fieldKey, fieldVal)
      }
      currentBatchSize = 0
    }

    currentBatchSize += file.size
    currentFormData.append(formKey, file)
  }
  allRequestBodies.push(currentFormData)

  let numBodies = allRequestBodies.length

  if (numBodies === 1) {
    await axios.post(url,
      allRequestBodies[0], {
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: progressEvent => {
          reportProgressPercentFunc(
            Math.round((progressEvent.loaded/progressEvent.total)*100)
          )
        }
      },
    )

    return
  }

  if (numBodies > 1) {
    let multipartKey = generateRandomLetterString(20)

    for (let i=0; i<numBodies; i++) {
      allRequestBodies[i].append('isMultipart', true)
      allRequestBodies[i].append('multipartNumber', i+1)
      allRequestBodies[i].append('totalNumberOfParts', numBodies)
      allRequestBodies[i].append('multipartKey', multipartKey)
    }

    for (let i=0; i<numBodies; i++) {
      await axios.post(url,
        allRequestBodies[i], {
          headers: {'Content-Type': 'multipart/form-data'},
          onUploadProgress: progressEvent => {
            let thisFrac = progressEvent.loaded / progressEvent.total
            let totalFrac = (i + thisFrac/numBodies) / numBodies
            reportProgressPercentFunc(Math.round(totalFrac * 100))
          }
        }
      )
    }

    return
  }
}