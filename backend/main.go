// package main

// import (
// 	"context"
// 	"fmt"
// 	"image"
// 	_ "image/jpeg"
// 	"image/png"
// 	"log"
// 	"net/http"
// 	"os"
// 	"os/signal"
// 	"syscall"

// 	"github.com/nfnt/resize"
// 	"github.com/rs/cors"
// )

// func uploadThumbnailHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	// Parse the uploaded file
// 	err := r.ParseMultipartForm(10 << 20) // Max 10 MB
// 	if err != nil {
// 		http.Error(w, "Unable to parse form", http.StatusBadRequest)
// 		return
// 	}

// 	file, handler, err := r.FormFile("image")
// 	if err != nil {
// 		http.Error(w, "Error retrieving file", http.StatusInternalServerError)
// 		return
// 	}
// 	defer file.Close()

// 	fmt.Printf("Uploaded File: %+v\n", handler.Filename)

// 	// Decode the image
// 	img, format, err := image.Decode(file)
// 	if err != nil {
// 		http.Error(w, "Error decoding image", http.StatusBadRequest)
// 		return
// 	}
// 	fmt.Println("Image format:", format)

// 	// Resize image to 150x150 (thumbnail)
// 	thumbnail := resize.Resize(150, 150, img, resize.Lanczos3)

// 	// Save the thumbnail
// 	out, err := os.Create("thumbnail.png")
// 	if err != nil {
// 		http.Error(w, "Unable to save thumbnail", http.StatusInternalServerError)
// 		return
// 	}
// 	defer out.Close()

// 	// Encode thumbnail as PNG
// 	err = png.Encode(out, thumbnail)
// 	if err != nil {
// 		http.Error(w, "Error encoding thumbnail", http.StatusInternalServerError)
// 		return
// 	}

// 	fmt.Fprintln(w, "Thumbnail generated and saved successfully!")
// }

// func main() {
// 	var router = http.NewServeMux()
// 	router.HandleFunc("/upload-thumbnail", uploadThumbnailHandler)

// 	c := cors.New(cors.Options{
// 		AllowedOrigins:   []string{"*"},
// 		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
// 		AllowedHeaders:   []string{"Content-Type", "Authorization"},
// 		AllowCredentials: true,
// 		// Debug:            true,
// 	})

// 	handler := securityHeaders(c.Handler(router))

// 	server := &http.Server{
// 		Addr:    ":8080",
// 		Handler: handler, // Use the middleware-wrapped handler
// 	}

// 	// Start server in a goroutine to handle graceful shutdown
// 	go func() {
// 		log.Println("Server started on port 4000")
// 		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
// 			log.Fatalf("Could not listen on port 4000: %v", err)
// 		}
// 	}()

// 	// Graceful shutdown listener
// 	shutdownChan := make(chan os.Signal, 1)
// 	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

// 	// Wait for termination signal
// 	<-shutdownChan
// 	log.Println("Shutting down gracefully...")

// 	// Attempt to gracefully shut down the server
// 	if err := server.Shutdown(context.Background()); err != nil {
// 		log.Fatalf("Server shutdown failed: %v", err)
// 	}
// 	log.Println("Server stopped")
// }

// // Security headers middleware
// func securityHeaders(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		// Set HTTP headers for enhanced security
// 		w.Header().Set("X-XSS-Protection", "1; mode=block")
// 		w.Header().Set("X-Content-Type-Options", "nosniff")
// 		w.Header().Set("X-Frame-Options", "DENY")
// 		next.ServeHTTP(w, r) // Call the next handler
// 	})
// }

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/rs/cors"
)

func uploadThumbnailHandler(w http.ResponseWriter, r *http.Request) {
	// Parse form data
	err := r.ParseMultipartForm(10 << 20) // Limit to 10MB
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	// Retrieve the file
	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Save the file
	filePath := filepath.Join("./thumbnails", handler.Filename)
	outFile, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Error saving the file", http.StatusInternalServerError)
		return
	}
	defer outFile.Close()

	// Write the file content
	_, err = outFile.ReadFrom(file)
	if err != nil {
		http.Error(w, "Error writing the file", http.StatusInternalServerError)
		return
	}

	// Respond with success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "Thumbnail uploaded successfully", "ok": true, "file": "%s"}`, handler.Filename)
}

// func uploadThumbnailHandler(w http.ResponseWriter, r *http.Request) {
// 	// Parse the incoming form data
// 	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10MB limit
// 		http.Error(w, "File too large", http.StatusBadRequest)
// 		return
// 	}

// 	file, handler, err := r.FormFile("thumbnail")
// 	if err != nil {
// 		http.Error(w, "Error retrieving the file", http.StatusInternalServerError)
// 		return
// 	}
// 	defer file.Close()

// 	// Save the file to disk
// 	dst, err := os.Create("./thumbnails/" + handler.Filename)
// 	if err != nil {
// 		http.Error(w, "Unable to save the file", http.StatusInternalServerError)
// 		return
// 	}
// 	defer dst.Close()

// 	if _, err := io.Copy(dst, file); err != nil {
// 		http.Error(w, "Failed to save the file", http.StatusInternalServerError)
// 		return
// 	}

// 	// Respond with success
// 	w.Header().Set("Content-Type", "application/json")
// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprintf(w, `{"message": "Thumbnail uploaded successfully", "file": "%s"}`, handler.Filename)
// }

func main() {
	// Create the thumbnails directory
	if err := os.MkdirAll("./thumbnails", os.ModePerm); err != nil {
		fmt.Println("Failed to create thumbnails directory:", err)
		return
	}

	var router = http.NewServeMux()
	router.HandleFunc("/upload-thumbnail", uploadThumbnailHandler)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		// Debug:            true,
	})

	handler := securityHeaders(c.Handler(router))

	server := &http.Server{
		Addr:    ":8080",
		Handler: handler, // Use the middleware-wrapped handler
	}

	// Start server in a goroutine to handle graceful shutdown
	go func() {
		log.Println("Server started on port 8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on port 8080: %v", err)
		}
	}()

	// Graceful shutdown listener
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	// Wait for termination signal
	<-shutdownChan
	log.Println("Shutting down gracefully...")

	// Attempt to gracefully shut down the server
	if err := server.Shutdown(context.Background()); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
	log.Println("Server stopped")
}

// Security headers middleware
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set HTTP headers for enhanced security
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		next.ServeHTTP(w, r) // Call the next handler
	})
}
