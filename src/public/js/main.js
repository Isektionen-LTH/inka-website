function resizeBusinessThumbnails() {
  const businessThumbnails = document.querySelectorAll('.business-thumbnail')
  const scale = 0.7

  // Only resize images if there are any
  if (businessThumbnails.length > 0) {
    // Get the current column width in pixels
    const parentColumn = businessThumbnails[0]
    const columnWidth = parentColumn.offsetWidth
                          - parseFloat(window.getComputedStyle(parentColumn, null).getPropertyValue('padding-left'))
                          - parseFloat(window.getComputedStyle(parentColumn, null).getPropertyValue('padding-right'))
    const maxHeight = scale * columnWidth

    // Set the maximum height for all the images
    businessThumbnails.forEach( thumb => {
      const img = thumb.querySelector('img')
      img.style.maxHeight = maxHeight + 'px'
    })
  }
}

async function showBusiness(business) {
  const response = await fetch(`/api/business/${business}`)

  if (response.ok) {
    const businessObject = await response.json()

    // Business text info
    document.getElementById('businessName').textContent = businessObject.name
    document.getElementById('businessAbout').textContent = businessObject.info.about
    document.getElementById('businessValues').textContent = businessObject.info.values

    // Social links
    document.getElementById('businessWebsiteLink').style.display = businessObject.info.social.website ? 'block' : 'none'
    document.getElementById('businessWebsiteLink').href = businessObject.info.social.website

    document.getElementById('businessLinkedinLink').style.display = businessObject.info.social.linkedin ? 'block' : 'none'
    document.getElementById('businessLinkedinLink').href = businessObject.info.social.linkedin

    document.getElementById('businessFacebookLink').style.display = businessObject.info.social.facebook ? 'block' : 'none'
    document.getElementById('businessFacebookLink').href = businessObject.info.social.facebook

    document.getElementById('businessInstagramLink').style.display = businessObject.info.social.instagram ? 'block' : 'none'
    document.getElementById('businessInstagramLink').href = businessObject.info.social.instagram

    // Populate businessInfoModal and show it
    $('#businessInfoModal').modal('show')
  }
  else {
    // TODO Show error modal
    alert('Error getting business')
  }
}

resizeBusinessThumbnails()