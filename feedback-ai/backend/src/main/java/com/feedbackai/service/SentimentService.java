package com.feedbackai.service;

import java.time.Duration;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SentimentService {
    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);
    private static final Set<String> VALID = Set.of("POSITIVE", "NEUTRAL", "NEGATIVE");
    private final RestClient client;

    public SentimentService(@Value("${sentiment.service.url}") String baseUrl, RestClient.Builder builder) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(2));
        factory.setReadTimeout(Duration.ofSeconds(2));
        this.client = builder.baseUrl(baseUrl).requestFactory(factory).build();
    }

    public String analyze(String text) {
        try {
            AnalyzeResponse response = client.post().uri("/analyze").body(new AnalyzeRequest(text))
                .retrieve().body(AnalyzeResponse.class);
            if (response != null && VALID.contains(response.sentiment())) return response.sentiment();
            log.warn("Sentiment service returned an invalid sentiment; using NEUTRAL");
        } catch (RuntimeException ex) {
            log.warn("Sentiment service unavailable; using NEUTRAL ({})", ex.getClass().getSimpleName());
        }
        return "NEUTRAL";
    }

    private record AnalyzeRequest(String text) {}
    private record AnalyzeResponse(String sentiment, Double score) {}
}
