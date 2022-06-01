//data.json 내용을 로컬스토리지에 문자형식으로 넣는다.
async function dataSet() {
  const data = await fetch("./data.json")
  .then(response => {
    return response.json();
  });
  window.localStorage.setItem('storageList',JSON.stringify(data));
}

//로컬스토리지의 내용을 읽어서 테이블에 데이터를 바인딩시킨다. 
function boardListAction() {
  let storageList = JSON.parse(window.localStorage.getItem('storageList'));
  const dataTable = document.getElementById('dataTable');

  storageList.forEach(data => {
    let tr = document.createElement("tr");
    let th_no = document.createElement("th");
    let td_title = document.createElement("td");
    let td_content = document.createElement("td");
    let td_date = document.createElement("td");

    th_no.setAttribute('scope', 'row');

    th_no.innerText = data.no;
    td_title.innerText = data.title;
    td_content.innerText = data.content.substr(0, 20) + '...'; //20글자 뒤에는 ... 으로 처리
    td_date.innerText = data.date;

    tr.appendChild(th_no);
    tr.appendChild(td_title);
    tr.appendChild(td_content);
    tr.appendChild(td_date);

    dataTable.appendChild(tr)

  });
}

function modalOpen() {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "block";
  document.getElementsByClassName("modal")[0].style.display = "block";
}

function modalClose() {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "none";
  document.getElementsByClassName("modal")[0].style.display = "none";
}

dataSet();
boardListAction();



function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
includeHTML();