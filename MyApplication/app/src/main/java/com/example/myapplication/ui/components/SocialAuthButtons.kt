package com.example.myapplication.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.myapplication.data.model.LegalResponse
import com.example.myapplication.ui.theme.WeddingTheme

@Composable
fun SocialAuthButtons(
    onGoogleClick: () -> Unit,
    rememberMe: Boolean,
    onRememberMeChange: (Boolean) -> Unit,
    agreementAgreed: Boolean,
    onAgreementAgreedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    legalData: LegalResponse? = null,
    onFetchLegal: (String) -> Unit = {},
    isLoadingLegal: Boolean = false
) {
    var showModal by remember { mutableStateOf(false) }
    var modalMode by remember { mutableStateOf("wizard") } // "wizard", "terms", "privacy"
    var wizardStep by remember { mutableIntStateOf(1) }

    if (showModal) {
        AgreementModal(
            mode = modalMode,
            step = wizardStep,
            legalData = legalData,
            onClose = { showModal = false },
            onNextStep = { wizardStep = 2 },
            onBackStep = { wizardStep = 1 },
            onAgree = {
                onAgreementAgreedChange(true)
                showModal = false
            },
            onFetchLegal = onFetchLegal,
            isLoading = isLoadingLegal
        )
    }

    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedButton(
            onClick = onGoogleClick,
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            enabled = agreementAgreed && rememberMe,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            )
        ) {
            GoogleLogo(modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                "Sign in with Google",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
                checked = rememberMe,
                onCheckedChange = onRememberMeChange
            )
            Text(
                "Ingat Saya",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { onRememberMeChange(!rememberMe) }
            )
        }

        Row(verticalAlignment = Alignment.Top) {
            Checkbox(
                checked = agreementAgreed,
                onCheckedChange = { checked ->
                    if (checked) {
                        modalMode = "wizard"
                        wizardStep = 1
                        onFetchLegal("terms")
                        showModal = true
                    } else {
                        onAgreementAgreedChange(false)
                    }
                }
            )
            
            val annotatedString = buildAnnotatedString {
                append("Dengan mencentang Setuju & Bergabung atau Lanjutkan, Anda menyetujui ")
                
                pushStringAnnotation(tag = "terms", annotation = "terms")
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold, textDecoration = TextDecoration.Underline)) {
                    append("Perjanjian Pengguna")
                }
                pop()
                
                append(", ")
                
                pushStringAnnotation(tag = "privacy", annotation = "privacy")
                withStyle(style = SpanStyle(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold, textDecoration = TextDecoration.Underline)) {
                    append("Kebijakan Privasi")
                }
                pop()
                
                append(" dan Kebijakan Cookie Wedding Flowers Decorasi.")
            }

            androidx.compose.foundation.text.ClickableText(
                text = annotatedString,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontSize = 11.sp,
                    lineHeight = 16.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                ),
                modifier = Modifier.padding(top = 12.dp),
                onClick = { offset ->
                    annotatedString.getStringAnnotations(tag = "terms", start = offset, end = offset).firstOrNull()?.let {
                        modalMode = "terms"
                        onFetchLegal("terms")
                        showModal = true
                    }
                    annotatedString.getStringAnnotations(tag = "privacy", start = offset, end = offset).firstOrNull()?.let {
                        modalMode = "privacy"
                        onFetchLegal("privacy")
                        showModal = true
                    }
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgreementModal(
    mode: String,
    step: Int,
    legalData: LegalResponse?,
    onClose: () -> Unit,
    onNextStep: () -> Unit,
    onBackStep: () -> Unit,
    onAgree: () -> Unit,
    onFetchLegal: (String) -> Unit,
    isLoading: Boolean
) {
    // When wizard step changes, fetch the appropriate data
    LaunchedEffect(step, mode) {
        if (mode == "wizard") {
            if (step == 1) onFetchLegal("terms")
            else if (step == 2) onFetchLegal("privacy")
        }
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Text(
                                text = legalData?.title ?: if (step == 1) "Perjanjian Pengguna" else "Kebijakan Privasi",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                        },
                        navigationIcon = {
                            if (mode == "wizard" && step == 2) {
                                IconButton(onClick = onBackStep) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Kembali")
                                }
                            } else if (mode != "wizard") {
                                IconButton(onClick = onClose) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Tutup")
                                }
                            }
                        },
                        actions = {
                            if (mode == "wizard") {
                                Text(
                                    "Langkah $step dari 2",
                                    modifier = Modifier.padding(end = 16.dp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.outline
                                )
                            }
                        }
                    )
                },
                bottomBar = {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shadowElevation = 8.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(16.dp)
                                .fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            if (mode == "wizard") {
                                if (step == 1) {
                                    Button(onClick = onNextStep) {
                                        Text("Lanjutkan")
                                    }
                                } else {
                                    Button(onClick = onAgree) {
                                        Text("Saya Mengerti & Setuju")
                                    }
                                }
                            } else {
                                OutlinedButton(onClick = onClose) {
                                    Text("Tutup")
                                }
                            }
                        }
                    }
                }
            ) { padding ->
                Box(modifier = Modifier.padding(padding).fillMaxSize()) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    } else if (legalData != null) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp)
                        ) {
                            legalData.content.forEachIndexed { index, item ->
                                Text(
                                    text = "${index + 1}. ${item.heading}",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                Text(
                                    text = item.body,
                                    style = MaterialTheme.typography.bodySmall,
                                    textAlign = TextAlign.Justify,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                            }
                        }
                    } else {
                        Text(
                            "Konten belum tersedia.",
                            modifier = Modifier.align(Alignment.Center),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun GoogleLogo(modifier: Modifier = Modifier) {
    androidx.compose.foundation.Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val center = androidx.compose.ui.geometry.Offset(width / 2, height / 2)
        val radius = width / 2

        // Google colors
        val red = Color(0xFFEA4335)
        val yellow = Color(0xFFFBBC05)
        val green = Color(0xFF34A853)
        val blue = Color(0xFF4285F4)

        // Chrome-like logo:
        // Red sector
        drawArc(
            color = red,
            startAngle = -150f,
            sweepAngle = 120f,
            useCenter = true
        )
        // Green sector
        drawArc(
            color = green,
            startAngle = -30f,
            sweepAngle = 120f,
            useCenter = true
        )
        // Yellow sector
        drawArc(
            color = yellow,
            startAngle = 90f,
            sweepAngle = 120f,
            useCenter = true
        )

        // White border around blue center
        drawCircle(
            color = Color.White,
            radius = radius * 0.45f,
            center = center
        )

        // Blue center circle
        drawCircle(
            color = blue,
            radius = radius * 0.35f,
            center = center
        )
    }
}

@Preview(showBackground = true)
@Composable
fun SocialAuthButtonsPreview() {
    WeddingTheme {
        SocialAuthButtons(
            onGoogleClick = {},
            rememberMe = true,
            onRememberMeChange = {},
            agreementAgreed = false,
            onAgreementAgreedChange = {},
            modifier = Modifier.padding(16.dp)
        )
    }
}
