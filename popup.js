document.addEventListener('DOMContentLoaded', () => {
    checkSEO();
    setupTabs();
  });
  
  function setupTabs() {
    const tabs = document.querySelectorAll('.tablink');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        openTab(tab, tab.dataset.tab);
      });
    });
    
    // Open the default tab (Summary)
    document.querySelector('.tablink[data-tab="Summary"]').click();
  }
  
  function openTab(clickedTab, tabName) {
    
    const tabContent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    clickedTab.classList.add("active");
  }
  
  function checkSEO() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: analyzeSEO
        },
        (results) => {
          displayResults(results[0].result);
        }
      );
    });
  }
  
  function analyzeSEO() {
    const results = {};
  
    // Get Title, Meta Description, Keywords, Lang, and Author
    results.title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    results.metaDescription = metaDescription ? metaDescription.content : 'Not defined';
    const keywords = document.querySelector('meta[name="keywords"]');
    results.keywords = keywords ? keywords.content : 'Not defined';
    results.lang = document.documentElement.lang || 'Not specified';
    const author = document.querySelector('meta[name="author"]');
    results.author = author ? author.content : 'Not defined';
    
     // Detect robots.txt link
  const robotsLink = `${window.location.origin}/robots.txt`;
  results.robotsLink = robotsLink;

  // Detect sitemap.xml link
  const sitemapLink = `${window.location.origin}/sitemap.xml`;
  results.sitemapLink = sitemapLink;
    // Get Headers
    results.headers = {};
    for (let i = 1; i <= 6; i++) {
      results.headers[`h${i}`] = Array.from(document.querySelectorAll(`h${i}`)).map(header => header.innerText);
    }
  
    // Get Images
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt || '(Alt image is missing)' ,
      title: img.title|| '(Title is missing)'
    }));
    results.images = {
      total: images.length,
      details: images
    };
  
    // Get Links
    const links = Array.from(document.querySelectorAll('a')).map(link => link.href);
    results.links = {
      total: links.length,
      urls: links
    };
  
    return results;
  }
  
  function displayResults(results) {
    // Display Summary
      // Display Summary
      const titleElement = document.getElementById('summaryTitle');
      titleElement.textContent = results.title;
      
      const descriptionElement = document.getElementById('summaryDescription');
      descriptionElement.textContent = results.metaDescription;
  
      // Check title length and set color
      if (results.title.length >= 30 && results.title.length <= 65) {
          titleElement.style.color = 'green';
      } else {
          titleElement.style.color = 'red';
      }
  
      // Check description length and set color
      if (results.metaDescription.length >= 120 && results.metaDescription.length <= 320) {
          descriptionElement.style.color = 'green';
      } else {
          descriptionElement.style.color = 'red';
      }
    document.getElementById('summaryKeywords').textContent = results.keywords;
    
    document.getElementById('summaryAuthor').textContent = results.author;
    document.getElementById('summaryHeaders').textContent = Object.values(results.headers).flat().length;
    document.getElementById('summaryImages').textContent = results.images.total;
    document.getElementById('summaryLinks').textContent = results.links.total;
    // Display robots.txt link
  const robotsTxtElement = document.getElementById('summaryRobots');
  robotsTxtElement.innerHTML = `<a href="${results.robotsLink}" target="_blank">robots.txt</a>`;

  // Display sitemap.xml link
  const sitemapElement = document.getElementById('summarySitemap');
  sitemapElement.innerHTML = `<a href="${results.sitemapLink}" target="_blank">sitemap.xml</a>`;
  
    // Meta Data
    const metaTitleElement = document.getElementById('metaTitle');
    metaTitleElement.textContent = results.title;
    metaTitleElement.style.color = (results.title.length >= 30 && results.title.length <= 65) ? 'green' : 'red';

    const metaDescriptionElement = document.getElementById('metaDescription');
    metaDescriptionElement.textContent = results.metaDescription;
    metaDescriptionElement.style.color = (results.metaDescription.length >= 120 && results.metaDescription.length <= 320) ? 'green' : 'red';

// Display length advice for Title
const titleAdviceContainer = document.createElement('div');
const titleAdvice = document.createElement('span');
titleAdvice.textContent = (results.title.length >= 30 && results.title.length <= 65) 
    ? `Good length for Title`
    : `Title length should be between 30 and 65 characters`;
titleAdvice.style.color = 'blue'; // Set color to blue
titleAdviceContainer.appendChild(titleAdvice);
metaTitleElement.appendChild(titleAdviceContainer);

// Display length advice for Meta Description
const descriptionAdviceContainer = document.createElement('div');
const descriptionAdvice = document.createElement('span');
descriptionAdvice.textContent = (results.metaDescription.length >= 120 && results.metaDescription.length <= 320) 
    ? `Good length for Meta Description`
    : `Meta Description length should be between 120 and 320 characters`;
descriptionAdvice.style.color = 'blue'; // Set color to blue
descriptionAdviceContainer.appendChild(descriptionAdvice);
metaDescriptionElement.appendChild(descriptionAdviceContainer);

document.getElementById('metaKeywords').textContent = results.keywords;


  
    // Headers
    const headersTree = document.getElementById('headersTree');
    headersTree.innerHTML = '';
    for (let i = 1; i <= 6; i++) {
      const headerList = results.headers[`h${i}`];
      if (headerList && headerList.length > 0) {
        const headerSection = document.createElement('div');
        headerSection.innerHTML = `<h3>H${i} Headers</h3>`;
        headerList.forEach(text => {
          const p = document.createElement('p');
          p.textContent = text;
          headerSection.appendChild(p);
        });
        headersTree.appendChild(headerSection);
      }
    }
  
    // Images
    document.getElementById('totalImages').textContent = results.images.total;
    const imagesList = document.getElementById('imagesList');
    imagesList.innerHTML = '';
    results.images.details.forEach(img => {
      const imgElement = document.createElement('div');
      imgElement.innerHTML = `
        <p><strong>Src:</strong> ${img.src}</p>
        <p><strong>Alt:</strong> ${img.alt}</p>
        <p><strong>Title:</strong> ${img.title}</p>
      `;
      imagesList.appendChild(imgElement);
    });
  
    // Links
    document.getElementById('totalLinks').textContent = results.links.total;
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';
    results.links.urls.forEach(link => {
      const linkElement = document.createElement('p');
      linkElement.textContent = link;
      linksList.appendChild(linkElement);
    });
  }

  function exportReport() {
    // Gather the SEO results (you might need to pass the results object if it's stored in a different scope)
    const results = {
        title: document.getElementById('summaryTitle').textContent,
        metaDescription: document.getElementById('summaryDescription').textContent,
        keywords: document.getElementById('metaKeywords').textContent,
        author: document.getElementById('summaryAuthor').textContent,
        headers: Array.from(document.querySelectorAll('#headersTree > div')).map(headerSection => {
            const headerTitle = headerSection.querySelector('h3').textContent;
            const headerTexts = Array.from(headerSection.querySelectorAll('p')).map(p => p.textContent);
            return { title: headerTitle, texts: headerTexts };
        }),
        images: Array.from(document.querySelectorAll('#imagesList > div')).map(imgElement => {
            return {
                src: imgElement.querySelector('strong').nextSibling.textContent.trim(),
                alt: imgElement.querySelectorAll('p')[1].textContent.replace(/.*:\s*/, ''),
                title: imgElement.querySelectorAll('p')[2].textContent.replace(/.*:\s*/, '')
            };
        }),
        links: Array.from(document.querySelectorAll('#linksList > p')).map(linkElement => linkElement.textContent)
    };

    // Create a text representation of the results
    let reportContent = `SEO Report\n\n`;
    reportContent += `Title: ${results.title}\n`;
    reportContent += `Meta Description: ${results.metaDescription}\n`;
    reportContent += `Keywords: ${results.keywords}\n`;
    reportContent += `Author: ${results.author}\n\n`;

    reportContent += `Headers:\n`;
    results.headers.forEach(header => {
        reportContent += `${header.title}:\n${header.texts.join('\n')}\n\n`;
    });

    reportContent += `Images:\n`;
    results.images.forEach(img => {
        reportContent += `Src: ${img.src}\nAlt: ${img.alt}\nTitle: ${img.title}\n\n`;
    });

    reportContent += `Links:\n`;
    results.links.forEach(link => {
        reportContent += `${link}\n`;
    });

    // Create a blob and generate a download link
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo_report.txt';
    document.body.appendChild(a);
    a.click();
    
    // Clean up the URL and link element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
const exportButton = document.getElementById('export')

exportButton.addEventListener('click', exportReport);
