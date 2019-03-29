package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	urllib "net/url"
	"os"
	"path/filepath"
)

const TILDA_BASE_URL = "http://api.tildacdn.info/v1/"

var BASEDIR = flag.String("basedir", "", "Base directory for export")
var TILDA_PUBLIC_KEY = flag.String("publickey", "", "Tilda.ws api public key")
var TILDA_SECRET_KEY = flag.String("secretkey", "", "Tilda.ws api secret key")
var TILDA_PROJECT_ID = flag.String("project", "", "Tilda.ws project id")

type TildaAPI struct {
	client    *http.Client
	baseUrl   *urllib.URL
	publicKey string
	secretKey string
}

type TildaProjectExportResponse struct {
	Status string
	Result struct {
		Id           string
		Title        string
		IndexPageId  string `json:"indexpageid"`
		CustomDomain string `json:"customdomain"`

		ExportCSSPath    string `json:"export_csspath"`
		ExportJSPath     string `json:"export_jspath"`
		ExportImagesPath string `json:"export_imgpath"`

		CSS []struct {
			From string
			To   string
		} `json:"css"`
		Images []struct {
			From string
			To   string
		} `json:"images"`
		Js []struct {
			From string
			To   string
		} `json:"js"`
	}
}

func (api *TildaAPI) doRequest(req *http.Request, data interface{}) error {
	qs := req.URL.Query()
	qs.Set("publickey", api.publicKey)
	qs.Set("secretkey", api.secretKey)
	req.URL.RawQuery = qs.Encode()

	log.Printf("do request to tilda api: %s", req.URL.String())

	response, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return err
	}

	if response.StatusCode != 200 {
		return fmt.Errorf("Bad tilda response code: %s, %s", response.StatusCode, string(responseBody))
	}

	if err := json.Unmarshal(responseBody, data); err != nil {
		return err
	}
	return nil
}

func (api *TildaAPI) GetProjectExport(projectId string) (*TildaProjectExportResponse, error) {
	reqUrl := fmt.Sprintf("%sgetprojectexport?projectid=%s", TILDA_BASE_URL, projectId)
	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return nil, err
	}
	data := &TildaProjectExportResponse{}
	if err := api.doRequest(req, data); err != nil {
		return nil, err
	}
	return data, nil
}

type TildaGetPagesListResponse struct {
	Status string
	Result []struct {
		Id string
	}
}

func (api *TildaAPI) GetPagesList(projectId string) (*TildaGetPagesListResponse, error) {
	reqUrl := fmt.Sprintf("%sgetpageslist?projectid=%s", TILDA_BASE_URL, projectId)
	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return nil, err
	}
	data := &TildaGetPagesListResponse{}
	if err := api.doRequest(req, data); err != nil {
		return nil, err
	}
	return data, nil
}

type TildaGetPageFullExportResponse struct {
	Status string
	Result struct {
		Id       string `json:"id"`
		Filename string `json:"filename"`
		HTML     string `json:"html"`
		Images   []struct {
			From string
			To   string
		} `json:"images"`
	}
}

func (api *TildaAPI) GetPageFullExport(pageId string) (*TildaGetPageFullExportResponse, error) {
	reqUrl := fmt.Sprintf("%sgetpagefullexport?pageid=%s", TILDA_BASE_URL, pageId)
	req, err := http.NewRequest("GET", reqUrl, nil)
	if err != nil {
		return nil, err
	}
	data := &TildaGetPageFullExportResponse{}
	if err := api.doRequest(req, data); err != nil {
		return nil, err
	}
	return data, nil
}

func (api *TildaAPI) DownloadUrl(url, dstFilename string) error {
	log.Printf("Downloading url %s to %s\n", url, dstFilename)
	response, err := api.client.Get(url)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	dst, err := os.Create(dstFilename)
	if err != nil {
		return err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, response.Body); err != nil {
		return err
	}
	return nil

}

func ExportWebsite(api *TildaAPI, projectId, basedir string) error {
	for _, dirname := range []string{"css", "images", "js"} {
		fullpath := filepath.Join(basedir, dirname)
		if err := os.MkdirAll(fullpath, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %s", fullpath, err)
		}
	}

	exportInfo, err := api.GetProjectExport(projectId)
	if err != nil {
		return fmt.Errorf("failed to get project export", err)
	}
	for _, finfo := range exportInfo.Result.CSS {
		fullpath := filepath.Join(basedir, "css", finfo.To)
		if err := api.DownloadUrl(finfo.From, fullpath); err != nil {
			return fmt.Errorf("failed to download url %s to %s: %s", finfo.From, fullpath, err)
		}
	}
	for _, finfo := range exportInfo.Result.Js {
		fullpath := filepath.Join(basedir, "js", finfo.To)
		if err := api.DownloadUrl(finfo.From, fullpath); err != nil {
			return fmt.Errorf("failed to download url %s to %s: %s", finfo.From, fullpath, err)
		}
	}
	for _, finfo := range exportInfo.Result.Images {
		fullpath := filepath.Join(basedir, "images", finfo.To)
		if err := api.DownloadUrl(finfo.From, fullpath); err != nil {
			return fmt.Errorf("failed to download url %s to %s: %s", finfo.From, fullpath, err)
		}
	}

	pageList, err := api.GetPagesList(projectId)
	if err != nil {
		return fmt.Errorf("failed to fetch page list", err)
	}

	for _, pageInfo := range pageList.Result {
		fullPageInfo, err := api.GetPageFullExport(pageInfo.Id)
		if err != nil {
			return fmt.Errorf("failed to fetch full page info for page %s: %s", pageInfo.Id, err)
		}
		fullpath := filepath.Join(basedir, fullPageInfo.Result.Filename)
		if err := ioutil.WriteFile(fullpath, []byte(fullPageInfo.Result.HTML), 0644); err != nil {
			return fmt.Errorf("failed to write page %s: %s", fullPageInfo.Result.Filename, err)
		}
		for _, finfo := range fullPageInfo.Result.Images {
			fullpath := filepath.Join(basedir, "images", finfo.To)
			if err := api.DownloadUrl(finfo.From, fullpath); err != nil {
				return fmt.Errorf("failed to download url %s to %s: %s", finfo.From, fullpath, err)
			}
		}
	}
	return nil
}

func main() {
	flag.Parse()
	api := &TildaAPI{
		client:    &http.Client{},
		publicKey: *TILDA_PUBLIC_KEY,
		secretKey: *TILDA_SECRET_KEY,
	}
	if err := ExportWebsite(api, *TILDA_PROJECT_ID, *BASEDIR); err != nil {
		log.Fatalf("Error: %s", err)
	}
}